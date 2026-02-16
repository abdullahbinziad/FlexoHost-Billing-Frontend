# Domain Portfolio Components

A comprehensive domain management page with modular component architecture.

## Folder Structure

```
src/components/domain-portfolio/
├── DomainPortfolioHeader.tsx      # Page header with breadcrumbs and add button
├── PromotionalBanner.tsx          # Promotional banner (dismissible)
├── DomainProtectionCard.tsx       # Domain protection offer card
├── DomainSearchAndFilter.tsx      # Search bar and filter dropdown
├── DomainTable.tsx                 # Main domain table component
├── DomainTableRow.tsx              # Individual domain row
└── DomainPortfolioPage.tsx         # Main page orchestrator
```

## State Management

### Redux (Global/Shared State)
- **Domain Data**: `useGetDomainsQuery()` - Fetches domains from API
- **Domain Updates**: `useUpdateDomainMutation()` - Updates auto-renewal, etc.
- **Domain Actions**: Renew, delete, bulk actions

### Local State (Component-Specific)
- **Search Input**: `useState` for search query
- **Filter Dropdown**: `useState` for dropdown open/close
- **Selected Domains**: `useState` for checkbox selections
- **Banner Visibility**: `useState` for dismissible banner
- **Sorting/Filtering**: `useState` for table filters

## Components

### DomainPortfolioHeader
- Page title and breadcrumbs
- "Add new domain" button

### PromotionalBanner
- Dismissible promotional banner
- Local state for visibility

### DomainProtectionCard
- Domain protection offer display
- Pricing with discount badge
- "Get now" button

### DomainSearchAndFilter
- Search input (local state)
- Filter dropdown (local state)
- Sort functionality

### DomainTable
- Sortable columns
- Bulk selection
- Displays domain rows

### DomainTableRow
- Individual domain information
- Status badges
- Auto-renewal toggle (Redux mutation)
- Action buttons (Renew, Manage, More)

### DomainPortfolioPage
- Main orchestrator component
- Combines all components
- Manages Redux queries and local state
- Handles filtering and sorting logic

## Features

- ✅ Responsive design
- ✅ Search and filter domains
- ✅ Sortable table columns
- ✅ Bulk selection
- ✅ Auto-renewal toggle
- ✅ Status badges
- ✅ Action buttons (Renew, Manage)
- ✅ Promotional banner
- ✅ Domain protection offer

## API Integration

All domain data is fetched via RTK Query:
- `GET /domains` - Get all domains
- `PATCH /domains/:id` - Update domain (auto-renewal)
- `POST /domains/:id/renew` - Renew domain
- `POST /domains/bulk-action` - Bulk actions
