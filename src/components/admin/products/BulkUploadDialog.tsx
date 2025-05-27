// src/components/admin/BulkUploadDialog.tsx
"use client";

import React, { useState, useRef } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Download
} from 'lucide-react';

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  details?: {
    successCount?: number;
    errorCount?: number;
    totalRows?: number;
    validationErrors?: string[];
    duplicateSkus?: string[];
    processingErrors?: string[];
  };
}

export function BulkUploadDialog({ open, onClose, onUploadComplete }: BulkUploadDialogProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadState({ status: 'idle' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadState({
        status: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    setUploadState({ status: 'uploading', message: 'Processing your file...' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadState({
          status: 'success',
          message: 'Upload completed successfully!',
          details: {
            successCount: result.data.successCount,
            errorCount: result.data.errorCount,
            totalRows: result.data.totalRows,
            processingErrors: result.data.processingErrors
          }
        });
        onUploadComplete();
      } else {
        setUploadState({
          status: 'error',
          message: result.error || 'Upload failed',
          details: result.details
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        status: 'error',
        message: 'An error occurred during upload'
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      'sku,name,shortDescription,source,brandName,regularPrice,costPrice,color,size,quantity,images',
      'SAREE-001,Red Banarasi Saree,Beautiful traditional saree,offline,Banarasi Weavers,2500,1800,Red,Free Size,5,https://example.com/image1.jpg',
      'KURTA-002,Cotton Kurta Set,Comfortable cotton kurta for men,own,Desi Threads,1200,800,Blue,M,10,https://example.com/image2.jpg',
      'LEHENGA-003,Wedding Lehenga,Designer wedding lehenga,online,Fashion Hub,8500,6000,Pink,L,2,https://example.com/image3.jpg'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-products.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadState({ status: 'idle' });
    onClose();
  };

  const reset = () => {
    setSelectedFile(null);
    setUploadState({ status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Product Upload
          </DialogTitle>
          <DialogDescription>
            Upload products in bulk using CSV or Excel files. Make sure your file follows the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sample File Download */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Need a template?</p>
                  <p className="text-sm text-muted-foreground">
                    Download a sample CSV file with the correct format
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadSampleCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Sample CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select File</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-lg font-medium">Drop your file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to select a CSV or Excel file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Status */}
          {uploadState.status === 'uploading' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadState.message}
                <div className="mt-2">
                  <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadState.status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-medium">{uploadState.message}</p>
                {uploadState.details && (
                  <div className="mt-2 text-sm">
                    <p>✅ {uploadState.details?.successCount} products created successfully</p>
                    {(uploadState.details?.errorCount ?? 0) > 0 && (
                      <p>❌ {uploadState.details?.errorCount} products failed</p>
                    )}
                    <p>📊 Total rows processed: {uploadState.details?.totalRows}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {uploadState.status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <p className="font-medium">{uploadState.message}</p>
                {uploadState.details && (
                  <div className="mt-2 text-sm space-y-2">
                    {uploadState.details.validationErrors && uploadState.details.validationErrors.length > 0 && (
                      <div>
                        <p className="font-medium">Validation Errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {uploadState.details.validationErrors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {uploadState.details.validationErrors.length > 5 && (
                            <li>... and {uploadState.details.validationErrors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {uploadState.details.duplicateSkus && uploadState.details.duplicateSkus.length > 0 && (
                      <div>
                        <p className="font-medium">Duplicate SKUs:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {uploadState.details.duplicateSkus.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {uploadState.details.duplicateSkus.length > 5 && (
                            <li>... and {uploadState.details.duplicateSkus.length - 5} more duplicates</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {uploadState.details.processingErrors && uploadState.details.processingErrors.length > 0 && (
                      <div>
                        <p className="font-medium">Processing Errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {uploadState.details.processingErrors.slice(0, 3).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {uploadState.details.processingErrors.length > 3 && (
                            <li>... and {uploadState.details.processingErrors.length - 3} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* CSV Format Guide */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Required CSV Columns:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Required:</strong> sku, name, source (offline/online/own), regularPrice</p>
                <p><strong>Optional:</strong> shortDescription, brandName, costPrice, color, size, quantity, images, etc.</p>
                <p><strong>Images:</strong> Comma-separated URLs for multiple images</p>
                <p><strong>Source Types:</strong> offline (vendor products), online (scraped), own (inventory managed)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || uploadState.status === 'uploading'}
            className="bg-tan text-black hover:bg-tan/90"
          >
            {uploadState.status === 'uploading' ? 'Uploading...' : 'Upload Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}