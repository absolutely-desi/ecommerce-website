// src/types/product.ts
export interface ProductVariant {
    id?: number;
    sku: string;
    name: string;
    color?: string;
    size?: string;
    quantity: number;
    stockStatus: boolean;
    regularPrice: number;
    costPrice?: number;
    onSale: boolean;
    salePrice?: number;
    discountCostPrice?: number;
    variantData?: any;
    active: boolean;
  }
  
  export interface ProductImage {
    id?: number;
    imageUrl: string;
    altText?: string;
    sortOrder?: number;
  }
  
  export interface ProductCategory {
    id: number;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }
  
  export interface ProductAttribute {
    id?: number;
    attributeName: string;
    attributeValue: string;
  }
  
  export interface ProductTag {
    id?: number;
    tagName: string;
  }
  
  export interface Product {
    id?: number;
    sku: string;
    name: string;
    shortDescription?: string;
    productDetail?: string;
    source: 'offline' | 'online' | 'own';
    brandName?: string;
    manufacturerInfo?: string;
    sourceUrl?: string;
    weight?: number;
    sizeChart?: string;
    manageInventory?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    active?: boolean;
    batchId?: string;
    createdAt?: string;
    updatedAt?: string;
    
    // Relationships
    variants?: ProductVariant[];
    categories?: ProductCategory[];
    images?: ProductImage[];
    attributes?: ProductAttribute[];
    tags?: ProductTag[];
    
    // Count fields (for API responses)
    _count?: {
      variants?: number;
    };
  }
  
  export interface UploadBatch {
    id: number;
    filename: string;
    uploadedBy: string;
    status: 'processing' | 'completed' | 'failed';
    totalRows: number;
    processedRows: number;
    successRows: number;
    errorRows: number;
    errorLog?: any;
    createdAt: string;
    completedAt?: string;
  }