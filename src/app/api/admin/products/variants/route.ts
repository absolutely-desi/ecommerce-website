// src/app/api/admin/products/variants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// POST /api/admin/products/variants - Create new variant
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.productId || !data.sku || !data.name || !data.regularPrice) {
      return NextResponse.json(
        { success: false, error: 'Product ID, SKU, name, and regular price are required' },
        { status: 400 }
      );
    }

    // Check for duplicate variant SKU
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: data.sku }
    });

    if (existingVariant) {
      return NextResponse.json(
        { success: false, error: 'Variant with this SKU already exists' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(data.productId) }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: parseInt(data.productId),
        sku: data.sku,
        name: data.name,
        color: data.color || null,
        size: data.size || null,
        quantity: parseInt(data.quantity) || 0,
        stockStatus: data.stockStatus !== false,
        regularPrice: parseFloat(data.regularPrice),
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        onSale: data.onSale === true,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        discountCostPrice: data.discountCostPrice ? parseFloat(data.discountCostPrice) : null,
        variantData: data.variantData || null,
        active: data.active !== false
      }
    });

    return NextResponse.json({
      success: true,
      data: { variant }
    });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}