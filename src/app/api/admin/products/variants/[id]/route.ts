// src/app/api/admin/products/variants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/admin/products/variants/[id] - Get single variant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = parseInt(params.id);
    
    if (isNaN(variantId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid variant ID' },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            source: true
          }
        }
      }
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { variant }
    });
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/variants/[id] - Update variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = parseInt(params.id);
    const data = await request.json();
    
    if (isNaN(variantId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid variant ID' },
        { status: 400 }
      );
    }

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Check for duplicate SKU (if SKU is being changed)
    if (data.sku && data.sku !== existingVariant.sku) {
      const duplicateSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku }
      });

      if (duplicateSku) {
        return NextResponse.json(
          { success: false, error: 'Another variant with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Update variant
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        sku: data.sku || existingVariant.sku,
        name: data.name || existingVariant.name,
        color: data.color !== undefined ? data.color : existingVariant.color,
        size: data.size !== undefined ? data.size : existingVariant.size,
        quantity: data.quantity !== undefined ? parseInt(data.quantity) : existingVariant.quantity,
        stockStatus: data.stockStatus !== undefined ? data.stockStatus : existingVariant.stockStatus,
        regularPrice: data.regularPrice !== undefined ? parseFloat(data.regularPrice) : existingVariant.regularPrice,
        costPrice: data.costPrice !== undefined ? (data.costPrice ? parseFloat(data.costPrice) : null) : existingVariant.costPrice,
        onSale: data.onSale !== undefined ? data.onSale : existingVariant.onSale,
        salePrice: data.salePrice !== undefined ? (data.salePrice ? parseFloat(data.salePrice) : null) : existingVariant.salePrice,
        discountCostPrice: data.discountCostPrice !== undefined ? (data.discountCostPrice ? parseFloat(data.discountCostPrice) : null) : existingVariant.discountCostPrice,
        variantData: data.variantData !== undefined ? data.variantData : existingVariant.variantData,
        active: data.active !== undefined ? data.active : existingVariant.active
      }
    });

    return NextResponse.json({
      success: true,
      data: { variant }
    });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/variants/[id] - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = parseInt(params.id);
    
    if (isNaN(variantId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid variant ID' },
        { status: 400 }
      );
    }

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            _count: {
              select: {
                variants: true
              }
            }
          }
        }
      }
    });

    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if it's the last variant
    if (existingVariant.product._count.variants <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last variant of a product' },
        { status: 400 }
      );
    }

    // Delete variant
    await prisma.productVariant.delete({
      where: { id: variantId }
    });

    return NextResponse.json({
      success: true,
      message: 'Variant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}