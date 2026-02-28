# 📚 Product API - Complete Documentation Index

Your complete guide to integrating the Product/Hosting Package API into your frontend application.

---

## 🎯 Quick Navigation

| Document | Purpose | Best For |
|----------|---------|----------|
| **[API Quick Reference](#)** | Fast endpoint lookup | Quick reference during development |
| **[Frontend Integration Guide](#)** | Complete integration code | Full implementation |
| **[Backend API Specification](#)** | Detailed API docs | Understanding the API |
| **[Postman Collection](#)** | API testing | Testing before integration |

---

## 📖 Documentation Files

### 1. **API_QUICK_REFERENCE.md** ⚡
**Quick lookup for all endpoints**

- All 9 API endpoints with examples
- Request/response formats
- cURL commands
- Error responses
- Type references

**Use this when:** You need to quickly check an endpoint or request format.

---

### 2. **FRONTEND_INTEGRATION_GUIDE.md** 🔧
**Complete integration code for React/Next.js**

Contains:
- ✅ TypeScript types (copy-paste ready)
- ✅ API service functions
- ✅ React hooks (useProducts, useProduct)
- ✅ Complete usage examples
- ✅ Error handling patterns
- ✅ 3 working component examples

**Use this when:** You're ready to integrate the API into your frontend.

**Files to create in your frontend:**
```
src/
├── types/
│   └── product.types.ts          # TypeScript interfaces
├── services/
│   └── productApi.ts              # API service functions
├── hooks/
│   └── useProducts.ts             # React hooks
└── components/
    ├── ProductList.tsx            # Example component
    ├── CreateProductForm.tsx      # Example component
    └── ProductSearch.tsx          # Example component
```

---

### 3. **BACKEND_API_SPEC_HOSTING_PRODUCTS.md** 📋
**Detailed API specification**

- Complete data models
- Database schema
- Validation rules
- Implementation checklist
- Testing examples
- Notes for developers

**Use this when:** You need to understand the API in depth or troubleshoot issues.

---

### 4. **postman_collection.json** 🧪
**Postman collection for testing**

Contains:
- All 9 Product API endpoints
- Pre-configured requests
- Auto-save product ID
- Query parameter examples
- Full request bodies

**Use this when:** Testing the API before frontend integration.

**How to use:**
1. Import into Postman
2. Set `baseUrl` and `accessToken` variables
3. Test all endpoints
4. Verify responses

---

## 🚀 Getting Started (3 Steps)

### Step 1: Test the API (5 minutes)
1. Import `postman_collection.json` into Postman
2. Login to get admin token
3. Set token in collection variables
4. Test "Create Product" endpoint
5. Verify it works ✅

### Step 2: Set Up Frontend (10 minutes)
1. Open `FRONTEND_INTEGRATION_GUIDE.md`
2. Copy TypeScript types to `src/types/product.types.ts`
3. Copy API service to `src/services/productApi.ts`
4. Copy hooks to `src/hooks/useProducts.ts`
5. Set environment variable: `NEXT_PUBLIC_API_URL`

### Step 3: Build UI (30+ minutes)
1. Use the example components as templates
2. Customize for your design system
3. Add form validation
4. Implement error handling
5. Test all CRUD operations

---

## 📍 API Endpoints Summary

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | `/admin/products` | Create product |
| 2 | GET | `/admin/products` | Get all products |
| 3 | GET | `/admin/products/:id` | Get single product |
| 4 | PUT | `/admin/products/:id` | Update product |
| 5 | DELETE | `/admin/products/:id` | Delete product |
| 6 | PATCH | `/admin/products/:id/visibility` | Toggle visibility |
| 7 | GET | `/admin/products/search?q=term` | Search products |
| 8 | GET | `/admin/products/type/:type` | Get by type |
| 9 | GET | `/admin/products/group/:group` | Get by group |

**Base URL:** `http://localhost:5001/api/v1/admin/products`

---

## 💻 Code Examples

### Quick Example: Fetch Products

```typescript
// 1. Import the hook
import { useProducts } from '@/hooks/useProducts';

// 2. Use in component
export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Quick Example: Create Product

```typescript
import { useProducts } from '@/hooks/useProducts';

export default function CreateProduct() {
  const { createProduct, loading } = useProducts();

  const handleSubmit = async (data) => {
    try {
      await createProduct({
        name: 'New Product',
        type: 'hosting',
        group: 'Web Hosting',
        paymentType: 'recurring',
        pricing: [...],
        features: [...]
      });
      alert('Product created!');
    } catch (err) {
      alert('Error creating product');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔐 Authentication

All endpoints require admin authentication:

```typescript
headers: {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

**Get token from:**
- Login endpoint: `POST /api/v1/auth/login`
- Store in localStorage or auth context
- Include in all Product API requests

---

## 📦 TypeScript Types (Quick Reference)

```typescript
// Main Product Interface
interface Product {
  id: string;
  name: string;
  type: 'hosting' | 'vps' | 'domain' | 'ssl';
  group: string;
  description?: string;
  paymentType: 'free' | 'one-time' | 'recurring';
  pricing?: CurrencyPricing[];
  features: string[];
  stock?: number | null;
  module?: ModuleConfig;
  freeDomain?: FreeDomain;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create Product DTO
interface CreateProductDTO {
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
```

**Full types available in:** `FRONTEND_INTEGRATION_GUIDE.md`

---

## ⚠️ Common Errors & Solutions

### Error: "Product name already exists"
**Solution:** Product names must be unique. Choose a different name.

### Error: "At least one billing cycle must be enabled"
**Solution:** Enable at least one billing cycle in the pricing array.

### Error: "Unauthorized"
**Solution:** 
1. Check if token is valid
2. Ensure token is included in headers
3. Login again to get fresh token

### Error: "Validation failed"
**Solution:** Check the error details for specific field errors and fix them.

---

## 🎨 UI/UX Recommendations

### Product List Page
- ✅ Show pagination
- ✅ Add filters (type, group, visibility)
- ✅ Include search functionality
- ✅ Show product status (visible/hidden)
- ✅ Add quick actions (edit, delete, toggle)

### Create/Edit Product Form
- ✅ Multi-step form for complex data
- ✅ Validate before submission
- ✅ Show pricing for all currencies
- ✅ Dynamic feature list (add/remove)
- ✅ Preview before saving

### Product Details Page
- ✅ Show all product information
- ✅ Display pricing table
- ✅ List all features
- ✅ Show module configuration
- ✅ Edit and delete actions

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] Test create product with valid data
- [ ] Test create product with duplicate name (should fail)
- [ ] Test get all products with pagination
- [ ] Test get all products with filters
- [ ] Test get single product
- [ ] Test update product
- [ ] Test delete product
- [ ] Test toggle visibility
- [ ] Test search functionality
- [ ] Test error handling
- [ ] Test with expired token
- [ ] Test with invalid product ID
- [ ] Test validation errors

---

## 📁 File Structure

```
FlexoHost-Billing-Backend/
├── 📄 API_QUICK_REFERENCE.md           ⭐ Quick endpoint reference
├── 📄 FRONTEND_INTEGRATION_GUIDE.md    ⭐ Complete integration code
├── 📄 BACKEND_API_SPEC_HOSTING_PRODUCTS.md  Detailed API spec
├── 📄 PRODUCT_API_IMPLEMENTATION_SUMMARY.md Backend implementation
├── 📄 POSTMAN_COLLECTION_UPDATE.md     Postman guide
├── 📄 postman_collection.json          ⭐ Postman collection
├── postman/
│   └── Product-API.postman_collection.json  Standalone collection
├── examples/
│   └── product-api-examples.ts         Usage examples
└── src/
    └── modules/
        └── product/
            ├── product.interface.ts    TypeScript types
            ├── product.model.ts        Database model
            ├── product.service.ts      Business logic
            ├── product.controller.ts   Request handlers
            ├── product.routes.ts       Route definitions
            ├── product.validation.ts   Validation rules
            ├── index.ts                Module exports
            └── README.md               Module documentation
```

---

## 🎯 Next Steps

### For Frontend Developers:
1. ✅ Read `FRONTEND_INTEGRATION_GUIDE.md`
2. ✅ Copy the code files to your project
3. ✅ Test with Postman first
4. ✅ Implement the UI components
5. ✅ Add error handling and validation

### For Backend Developers:
1. ✅ Review `BACKEND_API_SPEC_HOSTING_PRODUCTS.md`
2. ✅ Test all endpoints with Postman
3. ✅ Monitor for errors in production
4. ✅ Optimize database queries if needed

### For QA/Testing:
1. ✅ Use Postman collection for API testing
2. ✅ Follow testing checklist
3. ✅ Test edge cases and error scenarios
4. ✅ Verify data validation

---

## 💡 Tips & Best Practices

### Performance
- Use pagination for large product lists
- Implement caching for frequently accessed products
- Debounce search input

### Security
- Always validate admin token
- Sanitize user input
- Handle errors gracefully without exposing sensitive info

### UX
- Show loading states
- Provide clear error messages
- Confirm before deleting
- Auto-save form drafts

### Code Quality
- Use TypeScript for type safety
- Handle all error cases
- Write reusable components
- Add proper comments

---

## 🆘 Need Help?

### Documentation
- `API_QUICK_REFERENCE.md` - Quick endpoint lookup
- `FRONTEND_INTEGRATION_GUIDE.md` - Integration code
- `BACKEND_API_SPEC_HOSTING_PRODUCTS.md` - Detailed specs

### Testing
- Use Postman collection to test endpoints
- Check example requests in documentation
- Verify backend is running on correct port

### Common Issues
1. **401 Unauthorized** → Check token validity
2. **404 Not Found** → Verify endpoint URL
3. **400 Validation Error** → Check request body format
4. **409 Duplicate** → Product name already exists

---

## 📊 API Statistics

- **Total Endpoints:** 9
- **HTTP Methods:** GET, POST, PUT, PATCH, DELETE
- **Authentication:** Required (Admin only)
- **Response Format:** JSON
- **Pagination:** Supported
- **Filtering:** Supported
- **Search:** Full-text search available

---

## ✅ Quick Start Summary

```bash
# 1. Test API with Postman
Import postman_collection.json → Test endpoints

# 2. Set up frontend
Copy types → Copy services → Copy hooks

# 3. Build UI
Use example components → Customize → Test

# 4. Deploy
Test thoroughly → Deploy backend → Deploy frontend
```

---

**🎉 You're all set!** Choose the documentation that fits your needs and start building.

**Last Updated:** 2026-02-17  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
