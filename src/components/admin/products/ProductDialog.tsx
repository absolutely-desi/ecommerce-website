// src/components/admin/ProductDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, X } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: () => void;
}

export function ProductDialog({ open, onClose, product, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState<Product>({
    sku: '',
    name: '',
    source: 'offline' as const,
    active: true,
    manageInventory: false
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!product?.id;

  // Initialize form data
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        weight: product.weight ? Number(product.weight) : undefined
      });
      setVariants(product.variants || []);
    } else {
      setFormData({
        sku: '',
        name: '',
        source: 'offline' as const,
        active: true,
        manageInventory: false
      });
      setVariants([]);
    }
    setError('');
  }, [product, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: Product) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      sku: `${formData.sku}-VAR-${variants.length + 1}`,
      name: formData.name,
      quantity: 0,
      stockStatus: true,
      regularPrice: 0,
      onSale: false,
      active: true
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.sku || !formData.name || !formData.source) {
        throw new Error('SKU, name, and source are required');
      }

      const url = isEditing ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // If there are variants, create them
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantData = {
              ...variant,
              productId: result.data.product.id
            };

            const variantUrl = variant.id 
              ? `/api/admin/products/variants/${variant.id}` 
              : '/api/admin/products/variants';
            const variantMethod = variant.id ? 'PUT' : 'POST';

            await fetch(variantUrl, {
              method: variantMethod,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(variantData)
            });
          }
        }

        onSave();
      } else {
        throw new Error(result.error || 'Failed to save product');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update product information and variants' : 'Create a new product with variants'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="e.g., SAREE-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Red Banarasi Saree"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <Label htmlFor="productDetail">Product Details</Label>
                <textarea
                  id="productDetail"
                  value={formData.productDetail || ''}
                  onChange={(e) => handleInputChange('productDetail', e.target.value)}
                  placeholder="Detailed product description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          {/* Source & Brand Information */}
          <Card>
            <CardHeader>
              <CardTitle>Source & Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleInputChange('source', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline Vendor</SelectItem>
                      <SelectItem value="online">Online Scraped</SelectItem>
                      <SelectItem value="own">Own Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName || ''}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    placeholder="e.g., Banarasi Weavers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manufacturerInfo">Manufacturer Info</Label>
                  <Input
                    id="manufacturerInfo"
                    value={formData.manufacturerInfo || ''}
                    onChange={(e) => handleInputChange('manufacturerInfo', e.target.value)}
                    placeholder="Manufacturer details"
                  />
                </div>
                {formData.source === 'online' && (
                  <div>
                    <Label htmlFor="sourceUrl">Source URL</Label>
                    <Input
                      id="sourceUrl"
                      value={formData.sourceUrl || ''}
                      onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                      placeholder="Original product URL"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.50"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="manageInventory"
                    checked={formData.manageInventory || formData.source === 'own'}
                    disabled={formData.source === 'own'}
                    onChange={(e) => handleInputChange('manageInventory', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="manageInventory">Manage Inventory</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active !== false}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="active">Active Product</Label>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Product Variants
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No variants added. Click "Add Variant" to create product variants.
                </p>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Variant {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Variant SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                            placeholder="Variant SKU"
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Input
                            value={variant.color || ''}
                            onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                            placeholder="e.g., Red"
                          />
                        </div>
                        <div>
                          <Label>Size</Label>
                          <Input
                            value={variant.size || ''}
                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                            placeholder="e.g., M, L, XL"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Regular Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.regularPrice}
                            onChange={(e) => handleVariantChange(index, 'regularPrice', parseFloat(e.target.value))}
                            required
                          />
                        </div>
                        <div>
                          <Label>Cost Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.costPrice || ''}
                            onChange={(e) => handleVariantChange(index, 'costPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={variant.quantity}
                            onChange={(e) => handleVariantChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`variant-${index}-active`}
                            checked={variant.active}
                            onChange={(e) => handleVariantChange(index, 'active', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`variant-${index}-active`}>Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`variant-${index}-stock`}
                            checked={variant.stockStatus}
                            onChange={(e) => handleVariantChange(index, 'stockStatus', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`variant-${index}-stock`}>In Stock</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-tan text-black hover:bg-tan/90"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}