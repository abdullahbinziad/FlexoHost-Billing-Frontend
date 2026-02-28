# Product API - Frontend Integration Guide

Complete guide for integrating the Product/Hosting Package API into your React/Next.js frontend.

---

## 📋 Table of Contents
1. [API Endpoints](#api-endpoints)
2. [TypeScript Types](#typescript-types)
3. [API Service Functions](#api-service-functions)
4. [React Hooks](#react-hooks)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5001/api/v1/admin/products
```

### Authentication
All endpoints require admin authentication. Include the JWT token in headers:
```typescript
headers: {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

### Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products` | Create a new product |
| GET | `/admin/products` | Get all products (with filters) |
| GET | `/admin/products/:id` | Get single product by ID |
| PUT | `/admin/products/:id` | Update a product |
| DELETE | `/admin/products/:id` | Delete a product |
| PATCH | `/admin/products/:id/visibility` | Toggle product visibility |
| GET | `/admin/products/search?q=term` | Search products |
| GET | `/admin/products/type/:type` | Get products by type |
| GET | `/admin/products/group/:group` | Get products by group |

---

## 📦 TypeScript Types

Create a file: `src/types/product.types.ts`

```typescript
/**
 * Product Types
 */
export type ProductType = 'hosting' | 'vps' | 'domain' | 'ssl';
export type PaymentType = 'free' | 'one-time' | 'recurring';
export type ModuleName = 'cpanel' | 'directadmin' | 'plesk' | 'virtualizor' | 'none';
export type FreeDomainType = 'none' | 'once' | 'recurring';
export type Currency = 'BDT' | 'USD' | 'EUR' | 'GBP';

/**
 * Pricing Detail Interface
 */
export interface PricingDetail {
  price: number;
  setupFee: number;
  renewPrice: number;
  enable: boolean;
}

/**
 * Currency Pricing Interface
 */
export interface CurrencyPricing {
  currency: Currency;
  monthly: PricingDetail;
  quarterly: PricingDetail;
  semiAnnually: PricingDetail;
  annually: PricingDetail;
  biennially: PricingDetail;
  triennially: PricingDetail;
}

/**
 * Module Configuration Interface
 */
export interface ModuleConfig {
  name: ModuleName;
  serverGroup?: string;
  packageName?: string;
}

/**
 * Free Domain Settings Interface
 */
export interface FreeDomain {
  enabled: boolean;
  type: FreeDomainType;
  paymentTerms?: string[];
  tlds?: string[];
}

/**
 * Product Interface
 */
export interface Product {
  id: string;
  name: string;
  type: ProductType;
  group: string;
  description?: string;
  paymentType: PaymentType;
  pricing?: CurrencyPricing[];
  features: string[];
  stock?: number | null;
  module?: ModuleConfig;
  freeDomain?: FreeDomain;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/Update Product DTO
 */
export interface CreateProductDTO {
  name: string;
  type: ProductType;
  group: string;
  description?: string;
  paymentType: PaymentType;
  pricing?: CurrencyPricing[];
  features: string[];
  stock?: number | null;
  module?: ModuleConfig;
  freeDomain?: FreeDomain;
  isHidden?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

/**
 * Query Filters
 */
export interface ProductQueryParams {
  type?: ProductType;
  group?: string;
  isHidden?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Pagination Response
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductListResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}
```

---

## 🔧 API Service Functions

Create a file: `src/services/productApi.ts`

```typescript
import { 
  Product, 
  CreateProductDTO, 
  UpdateProductDTO, 
  ProductQueryParams,
  ProductListResponse,
  ApiResponse 
} from '@/types/product.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/admin/products`;

/**
 * Get authorization headers
 */
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

/**
 * Handle API errors
 */
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.message || 'An error occurred');
  }
  return response.json();
};

/**
 * Product API Service
 */
export const productApi = {
  /**
   * Create a new product
   */
  async createProduct(
    productData: CreateProductDTO,
    token: string
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(PRODUCTS_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(productData),
    });
    return handleApiError(response);
  },

  /**
   * Get all products with optional filtering
   */
  async getProducts(
    params: ProductQueryParams = {},
    token: string
  ): Promise<ApiResponse<ProductListResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = queryString ? `${PRODUCTS_ENDPOINT}?${queryString}` : PRODUCTS_ENDPOINT;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleApiError(response);
  },

  /**
   * Get a single product by ID
   */
  async getProductById(
    productId: string,
    token: string
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleApiError(response);
  },

  /**
   * Update a product
   */
  async updateProduct(
    productId: string,
    updateData: UpdateProductDTO,
    token: string
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updateData),
    });
    return handleApiError(response);
  },

  /**
   * Delete a product
   */
  async deleteProduct(
    productId: string,
    token: string
  ): Promise<ApiResponse<null>> {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    return handleApiError(response);
  },

  /**
   * Toggle product visibility
   */
  async toggleVisibility(
    productId: string,
    isHidden: boolean,
    token: string
  ): Promise<ApiResponse<{ id: string; isHidden: boolean }>> {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/visibility`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ isHidden }),
    });
    return handleApiError(response);
  },

  /**
   * Search products
   */
  async searchProducts(
    searchTerm: string,
    token: string
  ): Promise<ApiResponse<Product[]>> {
    const response = await fetch(
      `${PRODUCTS_ENDPOINT}/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );
    return handleApiError(response);
  },

  /**
   * Get products by type
   */
  async getProductsByType(
    type: string,
    token: string
  ): Promise<ApiResponse<Product[]>> {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/type/${type}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleApiError(response);
  },

  /**
   * Get products by group
   */
  async getProductsByGroup(
    group: string,
    token: string
  ): Promise<ApiResponse<Product[]>> {
    const response = await fetch(
      `${PRODUCTS_ENDPOINT}/group/${encodeURIComponent(group)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );
    return handleApiError(response);
  },
};
```

---

## 🪝 React Hooks

Create a file: `src/hooks/useProducts.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { productApi } from '@/services/productApi';
import { 
  Product, 
  ProductQueryParams, 
  CreateProductDTO, 
  UpdateProductDTO 
} from '@/types/product.types';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

/**
 * Hook for managing products
 */
export const useProducts = (initialParams?: ProductQueryParams) => {
  const { token } = useAuth(); // Get auth token from your auth context
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  /**
   * Fetch products
   */
  const fetchProducts = useCallback(async (params?: ProductQueryParams) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.getProducts(params || initialParams || {}, token);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, initialParams]);

  /**
   * Create product
   */
  const createProduct = useCallback(async (productData: CreateProductDTO) => {
    if (!token) throw new Error('No authentication token');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.createProduct(productData, token);
      await fetchProducts(); // Refresh list
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  /**
   * Update product
   */
  const updateProduct = useCallback(async (
    productId: string, 
    updateData: UpdateProductDTO
  ) => {
    if (!token) throw new Error('No authentication token');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.updateProduct(productId, updateData, token);
      await fetchProducts(); // Refresh list
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  /**
   * Delete product
   */
  const deleteProduct = useCallback(async (productId: string) => {
    if (!token) throw new Error('No authentication token');
    
    setLoading(true);
    setError(null);
    
    try {
      await productApi.deleteProduct(productId, token);
      await fetchProducts(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  /**
   * Toggle visibility
   */
  const toggleVisibility = useCallback(async (
    productId: string, 
    isHidden: boolean
  ) => {
    if (!token) throw new Error('No authentication token');
    
    setLoading(true);
    setError(null);
    
    try {
      await productApi.toggleVisibility(productId, isHidden, token);
      await fetchProducts(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  /**
   * Search products
   */
  const searchProducts = useCallback(async (searchTerm: string) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.searchProducts(searchTerm, token);
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleVisibility,
    searchProducts,
  };
};

/**
 * Hook for single product
 */
export const useProduct = (productId: string) => {
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!token || !productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.getProductById(productId, token);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};
```

---

## 💡 Usage Examples

### Example 1: Product List Component

```typescript
'use client';

import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';

export default function ProductList() {
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    fetchProducts,
    deleteProduct,
    toggleVisibility 
  } = useProducts({ page: 1, limit: 10 });

  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts({ page, limit: 10 });
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        alert('Product deleted successfully');
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleToggleVisibility = async (productId: string, isHidden: boolean) => {
    try {
      await toggleVisibility(productId, !isHidden);
      alert('Visibility updated');
    } catch (err) {
      alert('Failed to update visibility');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products</h1>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Type: {product.type}</p>
            <p>Group: {product.group}</p>
            <p>Status: {product.isHidden ? 'Hidden' : 'Visible'}</p>
            
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleToggleVisibility(product.id, product.isHidden)}>
                {product.isHidden ? 'Show' : 'Hide'}
              </button>
              <button onClick={() => handleDelete(product.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? 'font-bold' : ''}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Example 2: Create Product Form

```typescript
'use client';

import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';
import { CreateProductDTO } from '@/types/product.types';

export default function CreateProductForm() {
  const { createProduct, loading } = useProducts();
  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    type: 'hosting',
    group: 'Web Hosting',
    description: '',
    paymentType: 'recurring',
    features: [],
    pricing: [],
    isHidden: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProduct(formData);
      alert('Product created successfully!');
      // Reset form or redirect
    } catch (err) {
      alert('Failed to create product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
        >
          <option value="hosting">Hosting</option>
          <option value="vps">VPS</option>
          <option value="domain">Domain</option>
          <option value="ssl">SSL</option>
        </select>
      </div>

      <div>
        <label>Group</label>
        <input
          type="text"
          value={formData.group}
          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

### Example 3: Search Products

```typescript
'use client';

import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';

export default function ProductSearch() {
  const { products, searchProducts, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchProducts(searchTerm);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="border p-2 rounded"
        />
        <button type="submit" disabled={loading} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
          Search
        </button>
      </form>

      {loading && <p>Searching...</p>}
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ⚠️ Error Handling

### Error Types

```typescript
// API Error Response
interface ApiError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'DUPLICATE_PRODUCT' | 'PRODUCT_NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN';
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### Error Handling Example

```typescript
try {
  await createProduct(productData);
} catch (error: any) {
  // Handle specific error codes
  if (error.message.includes('duplicate')) {
    alert('A product with this name already exists');
  } else if (error.message.includes('validation')) {
    alert('Please check your input and try again');
  } else if (error.message.includes('unauthorized')) {
    // Redirect to login
    router.push('/login');
  } else {
    alert('An unexpected error occurred');
  }
}
```

---

## 🔐 Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

---

## 📝 Quick Start Checklist

- [ ] Copy TypeScript types to `src/types/product.types.ts`
- [ ] Copy API service to `src/services/productApi.ts`
- [ ] Copy hooks to `src/hooks/useProducts.ts`
- [ ] Set up environment variables
- [ ] Ensure auth token is available in your app
- [ ] Test with Postman first
- [ ] Implement UI components
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test all CRUD operations

---

## 🚀 Next Steps

1. **Test the API** with Postman to ensure backend is working
2. **Copy the code** files to your frontend project
3. **Update imports** to match your project structure
4. **Integrate with your auth system** to get the admin token
5. **Build UI components** using the provided examples
6. **Add form validation** for better UX
7. **Implement toast notifications** for success/error messages

---

**Need Help?**
- Check `BACKEND_API_SPEC_HOSTING_PRODUCTS.md` for detailed API docs
- Review `examples/product-api-examples.ts` for more examples
- Test endpoints in Postman collection first

**Last Updated:** 2026-02-17
