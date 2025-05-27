// src/app/obm-admin/product-management/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BulkUploadDialog } from '@/components/admin/products/BulkUploadDialog';
import { ProductDialog } from '@/components/admin/products/ProductDialog';
import { Product, UploadBatch } from '@/types/product';

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog states
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(sourceFilter && { source: sourceFilter }),
        ...(activeFilter && { active: activeFilter })
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch upload batches
  const fetchUploadBatches = async () => {
    try {
      const response = await fetch('/api/admin/products/bulk-upload/batches?limit=5');
      const data = await response.json();

      if (data.success) {
        setUploadBatches(data.data.batches);
      }
    } catch (error) {
      console.error('Error fetching upload batches:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, sourceFilter, activeFilter]);

  useEffect(() => {
    fetchUploadBatches();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'offline': return 'bg-blue-500';
      case 'online': return 'bg-green-500';
      case 'own': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="admin-page-title">Product Management</h1>
          <p className="admin-page-subtitle">Manage your product catalog and bulk uploads</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowBulkUpload(true)}
            className="admin-button-primary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button 
            onClick={() => {
              setSelectedProduct(null);
              setShowProductDialog(true);
            }}
            className="admin-button-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Recent Upload Batches */}
      {uploadBatches.length > 0 && (
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="admin-card-title">Recent Bulk Uploads</CardTitle>
            <CardDescription>Latest bulk upload operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadBatches.map((batch) => (
                <div 
                  key={batch.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(batch.status)}
                    <div>
                      <p className="font-medium">{batch.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {batch.totalRows} total rows • {batch.successRows} success • {batch.errorRows} errors
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeColor(batch.status)}>
                      {batch.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">All Sources</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="own">Own</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="luxury-card">
        <CardHeader>
          <CardTitle className="admin-card-title">Products ({products.length})</CardTitle>
          <CardDescription>Manage your product catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tan"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center"><span class="text-xs text-gray-500">No img</span></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.brandName && (
                            <p className="text-sm text-muted-foreground">{product.brandName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <Badge className={getSourceBadgeColor(product.source)}>
                          {product.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product._count?.variants || product.variants?.length || 0} variants
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => product.id && handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="py-2 px-4 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BulkUploadDialog
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUploadComplete={() => {
          fetchProducts();
          fetchUploadBatches();
        }}
      />

      <ProductDialog
        open={showProductDialog}
        onClose={() => {
          setShowProductDialog(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={() => {
          fetchProducts();
          setShowProductDialog(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}