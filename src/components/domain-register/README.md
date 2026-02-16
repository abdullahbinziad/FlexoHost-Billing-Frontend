# Domain Register Components

Components for the "Get a New Domain" registration page.

## Folder Structure

```
src/components/domain-register/
├── PromotionalBanner.tsx          # New Year deal banner
├── DomainSearchModeSelector.tsx   # Find new domain / AI Generate toggle
├── DomainSearchBar.tsx            # Domain search input and button
├── TldPricingCard.tsx             # Individual TLD pricing card
├── TldPricingGrid.tsx             # Grid of TLD pricing cards
└── RegisterDomainPage.tsx         # Main page orchestrator
```

## State Management

### Local State (Component-Specific)
- **Search Mode**: `useState` for "find" vs "ai-generate" toggle
- **Search Input**: `useState` for domain search value
- **Banner Visibility**: `useState` for dismissible banner
- **Search Results**: `useState` for search results (temporary)

### Future Redux Integration
- Domain search results (when API is ready)
- Selected TLD
- Cart/checkout state

## Components

### RegisterPromotionalBanner
- New Year deal promotion
- Dismissible with X button
- Purple gradient design

### DomainSearchModeSelector
- Two mode buttons: "Find new domain" and "Generate domain using AI"
- Active state highlighting
- AI button has sparkle icons and pink dot indicator

### DomainSearchBar
- Large search input with magnifying glass icon
- Search button
- Form submission handling

### TldPricingCard
- Displays TLD name
- Original and discounted prices
- Save percentage badge
- Clickable (optional)

### TldPricingGrid
- Grid layout of TLD pricing cards
- Responsive (1-6 columns based on screen size)
- Uses static mock data

### RegisterDomainPage
- Main orchestrator component
- Combines all sub-components
- Handles search and TLD selection

## Static Data

TLD pricing data is stored in `src/data/mockTlds.ts`:
- .com: $0.01 (was $19.99)
- .net: $11.99 (was $17.99)
- .io: $31.99 (was $67.99)
- .org: $7.99 (was $15.99)
- .online: $0.99 (was $35.99)
- .shop: $0.99 (was $34.99)

## Features

- ✅ Responsive design
- ✅ Search mode toggle
- ✅ Domain search functionality
- ✅ TLD pricing display
- ✅ Promotional banner
- ✅ Static data ready for API replacement
