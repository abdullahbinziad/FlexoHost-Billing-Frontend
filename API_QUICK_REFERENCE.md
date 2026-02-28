# Product API - Quick Reference

Fast reference guide for Product API endpoints.

---

## 🔗 Base URL
```
http://localhost:5001/api/v1/admin/products
```

## 🔑 Authentication
```javascript
headers: {
  'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 📍 Endpoints

### 1. Create Product
```http
POST /admin/products
```

**Request Body:**
```json
{
  "name": "Business Hosting",
  "type": "hosting",
  "group": "Web Hosting",
  "description": "Perfect for businesses",
  "paymentType": "recurring",
  "pricing": [
    {
      "currency": "BDT",
      "monthly": { "price": 500, "setupFee": 0, "renewPrice": 500, "enable": true },
      "annually": { "price": 5000, "setupFee": 0, "renewPrice": 5000, "enable": true }
    }
  ],
  "features": ["10 GB SSD", "Free SSL"],
  "module": {
    "name": "cpanel",
    "serverGroup": "BDIX-01",
    "packageName": "business_10gb"
  },
  "freeDomain": {
    "enabled": true,
    "type": "once",
    "paymentTerms": ["Annually"],
    "tlds": [".com", ".net"]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Business Hosting",
    ...
  }
}
```

---

### 2. Get All Products
```http
GET /admin/products?page=1&limit=10&type=hosting&group=Web%20Hosting
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): hosting | vps | domain | ssl
- `group` (optional): Product group name
- `isHidden` (optional): true | false
- `sort` (optional): Sort field (default: -createdAt)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### 3. Get Single Product
```http
GET /admin/products/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product details retrieved",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Business Hosting",
    ...
  }
}
```

---

### 4. Update Product
```http
PUT /admin/products/:id
```

**Request Body:** (all fields optional)
```json
{
  "name": "Business Hosting Pro",
  "description": "Updated description",
  "features": ["20 GB SSD", "Free SSL", "Free CDN"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

---

### 5. Delete Product
```http
DELETE /admin/products/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

### 6. Toggle Visibility
```http
PATCH /admin/products/:id/visibility
```

**Request Body:**
```json
{
  "isHidden": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product visibility updated",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "isHidden": true
  }
}
```

---

### 7. Search Products
```http
GET /admin/products/search?q=business
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Search results retrieved",
  "data": [...]
}
```

---

### 8. Get Products by Type
```http
GET /admin/products/type/:type
```

**Example:**
```http
GET /admin/products/type/hosting
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...]
}
```

---

### 9. Get Products by Group
```http
GET /admin/products/group/:group
```

**Example:**
```http
GET /admin/products/group/Web%20Hosting
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...]
}
```

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed: Product name is required",
    "details": [
      { "field": "name", "message": "Product name is required" }
    ]
  }
}
```

### Duplicate Product (409)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PRODUCT",
    "message": "A product with this name already exists"
  }
}
```

### Product Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

---

## 🔧 cURL Examples

### Create Product
```bash
curl -X POST http://localhost:5001/api/v1/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Starter Plan",
    "type": "hosting",
    "group": "Web Hosting",
    "paymentType": "recurring",
    "pricing": [{
      "currency": "BDT",
      "monthly": {"price": 300, "setupFee": 0, "renewPrice": 300, "enable": true}
    }],
    "features": ["5 GB SSD", "Free SSL"]
  }'
```

### Get All Products
```bash
curl -X GET "http://localhost:5001/api/v1/admin/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Product
```bash
curl -X PUT http://localhost:5001/api/v1/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Updated Name"}'
```

### Delete Product
```bash
curl -X DELETE http://localhost:5001/api/v1/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 JavaScript/TypeScript Example

```typescript
// Fetch all products
const response = await fetch('http://localhost:5001/api/v1/admin/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.data.products);

// Create product
const newProduct = await fetch('http://localhost:5001/api/v1/admin/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Product',
    type: 'hosting',
    group: 'Web Hosting',
    paymentType: 'recurring',
    pricing: [...],
    features: [...]
  })
});
const result = await newProduct.json();
console.log(result.data);
```

---

## 📋 Product Types Reference

### Product Types
- `hosting` - Web hosting packages
- `vps` - Virtual Private Server
- `domain` - Domain registration
- `ssl` - SSL certificates

### Payment Types
- `free` - Free product
- `one-time` - One-time payment
- `recurring` - Recurring subscription

### Module Names
- `cpanel` - cPanel/WHM
- `directadmin` - DirectAdmin
- `plesk` - Plesk
- `virtualizor` - Virtualizor
- `none` - No module

### Currencies
- `BDT` - Bangladeshi Taka
- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound

### Billing Cycles
- `monthly` - 1 month
- `quarterly` - 3 months
- `semiAnnually` - 6 months
- `annually` - 12 months
- `biennially` - 24 months
- `triennially` - 36 months

---

**For detailed integration guide, see:** `FRONTEND_INTEGRATION_GUIDE.md`  
**For complete API specification, see:** `BACKEND_API_SPEC_HOSTING_PRODUCTS.md`
