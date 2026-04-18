# Config Folder - App Settings

Hi! This folder contains all the settings and configurations for our DragBizz Store app. Think of it as the "settings panel" for our application.

## 🔑 Authentication Strategy (Important)

**Login and Register pages are NOT hosted in this repository.**
- Authentication is handled by an external Auth service/repository.
- When redirecting to login or register, **always use `window.location.href`** (hard redirect) instead of Next.js internal routing. This ensures the browser breaks out of this SPA and hits the centralized auth service.

## What's in Here?

### `env.config.js` - Environment Settings
This file stores all the environment variables and app settings.

**What it does:**
- Stores the API server URL
- Sets the app name and version
- Defines cookie names (e.g., `logged_in` for session tracking)
- Tells us if we're in development or production mode

### `api.config.js` - API Endpoints
This file contains all the backend API endpoint paths.

**What it contains:**
- **Auth**: Session management (`PROFILE`, `REFRESH`, `LOGOUT`)
- **Retailer**: Core store management (Products, Invoices, Customers, etc.)
- **Utility**: File uploads and Socket.io endpoints
- **Voice AI & Subscriptions**: Service-specific endpoints

**Example usage:**
```javascript
import { API_CONFIG } from '@/config';

// Check user profile (Session verify)
const profileUrl = API_CONFIG.AUTH.PROFILE; // '/auth/profile'

// Logout (Internal API call)
const logoutUrl = API_CONFIG.AUTH.LOGOUT; // '/auth/logout'
```

### `index.js` - Main Export File
This file combines everything and makes it available to other parts of the app.

## How to Set Up Environment Variables

Create a `.env.local` file in your project root with these values:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000

# App Configuration  
NEXT_PUBLIC_APP_NAME=DragBizz Store
NEXT_PUBLIC_APP_VERSION=1.2.0
```

## Quick Examples

### Using API Config
```javascript
// Session management
const profileUrl = API_CONFIG.AUTH.PROFILE;
const logoutUrl = API_CONFIG.AUTH.LOGOUT;

// Retailer endpoints
const inventoryUrl = API_CONFIG.RETAILER.INVENTORY;
const storeUrl = API_CONFIG.RETAILER.STORE;
```

## 🛡️ Route Protection
Authentication-based route protection is handled by `src/middleware.js`. It checks for the `logged_in` cookie and performs a hard redirect to `/login` if it's missing on protected paths.

## Important Notes

1. **Always use config values** - Don't hardcode URLs in your components.
2. **External Auth** - Redirect to `/login` or `/register` using `window.location.href`.
3. **Don't commit .env.local** - This file contains environment-specific secrets.

## Common Mistakes to Avoid

- ❌ Hardcoding URLs in components.
- ❌ Using `router.push('/login')` (Next.js internal) instead of `window.location.href = '/login'`.
- ❌ Adding Login/Register logic to the service layer (this belongs in the Auth repo).

## Need Help?

- **App settings** (URLs, timeouts, app name) → Use `ENV_CONFIG`
- **API endpoints** (inventory, profile, orders) → Use `API_CONFIG`
