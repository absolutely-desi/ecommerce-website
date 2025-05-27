// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
        attributes: true,
        tags: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const data = await request.json();
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for duplicate SKU (if SKU is being changed)
    if (data.sku && data.sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: data.sku }
      });

      if (duplicateSku) {
        return NextResponse.json(
          { success: false, error: 'Another product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        sku: data.sku || existingProduct.sku,
        name: data.name || existingProduct.name,
        shortDescription: data.shortDescription,
        productDetail: data.productDetail,
        source: data.source || existingProduct.source,
        brandName: data.brandName,
        manufacturerInfo: data.manufacturerInfo,
        sourceUrl: data.sourceUrl,
        weight: data.weight ? parseFloat(data.weight) : null,
        sizeChart: data.sizeChart,
        manageInventory: data.manageInventory || false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        slug: data.slug,
        active: data.active !== false
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
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product (cascading delete will handle related records)
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}