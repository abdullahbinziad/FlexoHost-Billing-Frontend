# RTK Query API

This directory contains RTK Query API definitions.

Files:
- `baseApi.ts` - Base API configuration
- `authApi.ts` - Authentication endpoints
- `clientApi.ts` - Client panel endpoints
- `adminApi.ts` - Admin panel endpoints

To add new endpoints:
1. Create or update the appropriate API file
2. Use `api.injectEndpoints()` to add endpoints
3. Export hooks for use in components
