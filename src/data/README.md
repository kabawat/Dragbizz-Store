# Data Constants & Enums

This folder contains all static data, constants, and enums used throughout the application.

## Folder Structure

```
src/data/
├── constants/           # Static data constants
│   ├── currencies.js   # Currency options and utilities
│   ├── gstRates.js     # GST rate options and utilities
│   └── productStatus.js # Product status and visibility options
├── enums/              # Enum values
│   └── productUOM.js   # Product Unit of Measure enum
└── index.js            # Centralized exports
```

## Files Description

### Constants

#### `currencies.js`
- **CURRENCY_OPTIONS**: Array of supported currencies with symbols
- **DEFAULT_CURRENCY**: Default currency (INR)
- **getCurrencySymbol()**: Get currency symbol by code
- **getCurrencyLabel()**: Get currency label by code

#### `gstRates.js`
- **GST_RATE_OPTIONS**: Array of GST rates with descriptions
- **DEFAULT_GST_RATE**: Default GST rate (18%)
- **getGSTRateLabel()**: Get GST rate label by value
- **getGSTRateDescription()**: Get GST rate description by value

#### `productStatus.js`
- **PRODUCT_STATUS_OPTIONS**: Array of product status options
- **PRODUCT_VISIBILITY_OPTIONS**: Array of product visibility options
- **DEFAULT_PRODUCT_STATUS**: Default product status (ACTIVE)
- **DEFAULT_PRODUCT_VISIBILITY**: Default product visibility (PUBLIC)
- **getProductStatusLabel()**: Get product status label by value
- **getProductVisibilityLabel()**: Get product visibility label by value

### Enums

#### `productUOM.js`
- **PRODUCT_UOM**: Array of all supported UOM values
- **UOM_OPTIONS**: Formatted options for Select components with labels

## Usage

### Import Individual Constants
```javascript
import { CURRENCY_OPTIONS, UOM_OPTIONS } from '../../data';
```

### Import All Constants
```javascript
import { 
  CURRENCY_OPTIONS, 
  GST_RATE_OPTIONS, 
  PRODUCT_STATUS_OPTIONS,
  UOM_OPTIONS 
} from '../../data';
```

### Import Default Object
```javascript
import dataConstants from '../../data';
// Access: dataConstants.CURRENCY_OPTIONS
```

## Benefits

1. **Centralized Management**: All static data in one place
2. **Reusability**: Same data used across multiple components
3. **Maintainability**: Easy to update values in one location
4. **Type Safety**: Consistent data structure
5. **Documentation**: Well-documented with descriptions
6. **Utilities**: Helper functions for common operations

## Adding New Constants

1. Create new file in appropriate folder (`constants/` or `enums/`)
2. Export the constant/function
3. Add to `index.js` for centralized export
4. Update this README with description

## Example Usage in Components

```javascript
// Before (hardcoded)
const currencyOptions = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar (₹)' }
];

// After (imported)
import { CURRENCY_OPTIONS } from '../../data';
const currencyOptions = CURRENCY_OPTIONS;
```
