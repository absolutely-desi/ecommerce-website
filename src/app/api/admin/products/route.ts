// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

// GET /api/admin/products - List products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const source = searchParams.get('source') || '';
    const active = searchParams.get('active');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brandName: { contains: search } }
      ];
    }
    
    if (source) {
      where.source = source;
    }
    
    if (active !== null && active !== '') {
      where.active = active === 'true';
    }

    // Get products with related data
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          variants: true,
          categories: {
            include: {
              category: true
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: {
              variants: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.sku || !data.name || !data.source) {
      return NextResponse.json(
        { success: false, error: 'SKU, name, and source are required' },
        { status: 400 }
      );
    }

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        shortDescription: data.shortDescription,
        productDetail: data.productDetail,
        source: data.source,
        brandName: data.brandName,
        manufacturerInfo: data.manufacturerInfo,
        sourceUrl: data.sourceUrl,
        weight: data.weight ? parseFloat(data.weight) : null,
        sizeChart: data.sizeChart,
        manageInventory: data.manageInventory || false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        slug: data.slug,
        active: data.active !== false,
        batchId: data.batchId
      },
      include: {
        variants: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}