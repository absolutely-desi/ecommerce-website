// src/app/api/admin/products/bulk-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

// Helper function to validate CSV row data
function validateProductRow(row: any, rowIndex: number) {
  const errors: string[] = [];
  
  // Required fields validation
  if (!row.sku) {
    errors.push(`Row ${rowIndex + 1}: SKU is required`);
  }
  
  if (!row.name) {
    errors.push(`Row ${rowIndex + 1}: Product name is required`);
  }
  
  if (!row.source || !['offline', 'online', 'own'].includes(row.source)) {
    errors.push(`Row ${rowIndex + 1}: Valid source (offline/online/own) is required`);
  }
  
  // Pricing validation for variants
  if (!row.regularPrice || isNaN(parseFloat(row.regularPrice))) {
    errors.push(`Row ${rowIndex + 1}: Valid regular price is required`);
  }
  
  // Weight validation (if provided)
  if (row.weight && isNaN(parseFloat(row.weight))) {
    errors.push(`Row ${rowIndex + 1}: Weight must be a valid number`);
  }
  
  return errors;
}

// Helper function to generate unique batch ID
function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST /api/admin/products/bulk-upload - Process CSV/Excel upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only CSV and Excel files are allowed' },
        { status: 400 }
      );
    }

    // Parse CSV content
    const fileContent = await file.text();
    const rows = parseCSV(fileContent);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }

    // Create upload batch record
    const batchId = generateBatchId();
    const uploadBatch = await prisma.uploadBatch.create({
      data: {
        filename: file.name,
        uploadedBy: 'admin', // TODO: Get actual admin user
        status: 'processing',
        totalRows: rows.length
      }
    });

    // Validate all rows first
    const validationErrors: string[] = [];
    const duplicateSkus: string[] = [];
    const processedRows: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Validate row data
      const rowErrors = validateProductRow(row, i);
      validationErrors.push(...rowErrors);
      
      // Check for duplicate SKUs in the CSV
      const duplicateInBatch = processedRows.find(p => p.sku === row.sku);
      if (duplicateInBatch) {
        validationErrors.push(`Row ${i + 1}: Duplicate SKU '${row.sku}' found in CSV`);
      }
      
      // Check for existing SKUs in database
      if (row.sku) {
        const existingProduct = await prisma.product.findUnique({
          where: { sku: row.sku }
        });
        
        if (existingProduct) {
          duplicateSkus.push(`Row ${i + 1}: SKU '${row.sku}' already exists in database`);
        }
      }
      
      processedRows.push(row);
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      await prisma.uploadBatch.update({
        where: { id: uploadBatch.id },
        data: {
          status: 'failed',
          errorLog: { validationErrors, duplicateSkus },
          completedAt: new Date()
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: {
          validationErrors,
          duplicateSkus,
          totalErrors: validationErrors.length + duplicateSkus.length
        }
      });
    }

    // Process products if validation passes
    let successCount = 0;
    let errorCount = 0;
    const processingErrors: string[] = [];

    for (let i = 0; i < processedRows.length; i++) {
      try {
        const row = processedRows[i];
        
        // Create product
        const product = await prisma.product.create({
          data: {
            sku: row.sku,
            name: row.name,
            shortDescription: row.shortDescription || null,
            productDetail: row.productDetail || null,
            source: row.source,
            brandName: row.brandName || null,
            manufacturerInfo: row.manufacturerInfo || null,
            sourceUrl: row.sourceUrl || null,
            weight: row.weight ? parseFloat(row.weight) : null,
            sizeChart: row.sizeChart || null,
            manageInventory: row.manageInventory === 'true' || row.source === 'own',
            metaTitle: row.metaTitle || null,
            metaDescription: row.metaDescription || null,
            slug: row.slug || null,
            active: row.active !== 'false',
            batchId: batchId
          }
        });

        // Create default variant for the product
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: row.variantSku || `${row.sku}-DEFAULT`,
            name: row.variantName || row.name,
            color: row.color || null,
            size: row.size || null,
            quantity: row.quantity ? parseInt(row.quantity) : 0,
            stockStatus: row.stockStatus !== 'false',
            regularPrice: parseFloat(row.regularPrice),
            costPrice: row.costPrice ? parseFloat(row.costPrice) : null,
            onSale: row.onSale === 'true',
            salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
            active: row.variantActive !== 'false'
          }
        });

        // Handle images if provided
        if (row.images) {
          const imageUrls = row.images.split(',').map((url: string) => url.trim());
          for (let j = 0; j < imageUrls.length; j++) {
            if (imageUrls[j]) {
              await prisma.productImage.create({
                data: {
                  productId: product.id,
                  imageUrl: imageUrls[j],
                  sortOrder: j,
                  altText: `${product.name} - Image ${j + 1}`
                }
              });
            }
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        processingErrors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    // Update batch status
    await prisma.uploadBatch.update({
      where: { id: uploadBatch.id },
      data: {
        status: errorCount === 0 ? 'completed' : 'failed',
        processedRows: successCount + errorCount,
        successRows: successCount,
        errorRows: errorCount,
        errorLog: processingErrors.length > 0 ? { processingErrors } : Prisma.JsonNull,
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        totalRows: rows.length,
        successCount,
        errorCount,
        processingErrors
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk upload failed' },
      { status: 500 }
    );
  }
}

// Simple CSV parser (for basic implementation)
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }

  return rows;
}

// GET /api/admin/products/bulk-upload/batches - Get upload history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const [batches, totalCount] = await Promise.all([
      prisma.uploadBatch.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.uploadBatch.count()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        batches,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching upload batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upload history' },
      { status: 500 }
    );
  }
}