# Config Folder - App Settings

Hi! This folder contains all the settings and configurations for our DragBizz Store app. Think of it as the "settings panel" for our application.

## What's in Here?

### `env.config.js` - Environment Settings
This file stores all the environment variables and app settings. It's like the main settings file.

**What it does:**
- Stores the API server URL (where our backend is running)
- Sets the app name and version
- Defines login token names
- Tells us if we're in development or production mode

**Example usage:**
```javascript
import { ENV_CONFIG } from '@/config';

// Get the API URL
const apiUrl = ENV_CONFIG.API.URL;

// Check if we're in development
if (ENV_CONFIG.ENV.IS_DEVELOPMENT) {
  console.log('We are in development mode');
}
```

### `api.config.js` - API Endpoints
This file contains all the API endpoint URLs. It's like a phone book for all our backend routes.

**What it contains:**
- Login/Register URLs
- User profile URLs  
- Product URLs
- Order URLs
- Cart URLs
- Payment URLs
- Admin URLs

**Example usage:**
```javascript
import { API_CONFIG } from '@/config';

// Login endpoint
const loginUrl = API_CONFIG.AUTH.LOGIN; // '/auth/login'

// Get user profile
const profileUrl = API_CONFIG.USERS.PROFILE; // '/users/profile'
```

### `index.js` - Main Export File
This file combines everything and makes it available to other parts of the app.

**What it does:**
- Imports all config files
- Combines them into one object
- Exports everything so other files can use it

### `env.example` - Environment Template
This file shows you what environment variables you need to set up.

**How to use:**
1. Copy this file
2. Rename it to `.env.local`
3. Fill in your actual values

## How to Set Up Environment Variables

Create a `.env.local` file in your project root with these values:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000

# App Configuration  
NEXT_PUBLIC_APP_NAME=DragBizz Store
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication Keys
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken
```

## Quick Examples

### Using Environment Config
```javascript
// Get API settings
const apiUrl = ENV_CONFIG.API.URL;
const timeout = ENV_CONFIG.API.TIMEOUT;

// Get app info
const appName = ENV_CONFIG.APP.NAME;
const appVersion = ENV_CONFIG.APP.VERSION;

// Check environment
const isDev = ENV_CONFIG.ENV.IS_DEVELOPMENT;
const isProd = ENV_CONFIG.ENV.IS_PRODUCTION;
```

### Using API Config
```javascript
// Authentication endpoints
const loginUrl = API_CONFIG.AUTH.LOGIN;
const registerUrl = API_CONFIG.AUTH.REGISTER;
const logoutUrl = API_CONFIG.AUTH.LOGOUT;

// User endpoints
const profileUrl = API_CONFIG.USERS.PROFILE;
const updateProfileUrl = API_CONFIG.USERS.UPDATE_PROFILE;

// Product endpoints
const productsUrl = API_CONFIG.PRODUCTS.GET_ALL;
const productByIdUrl = API_CONFIG.PRODUCTS.GET_BY_ID;
```

## Important Notes

1. **Always use config values** - Don't hardcode URLs in your components
2. **Set up .env.local** - Make sure to create this file before running the app
3. **Don't commit .env.local** - This file contains secrets, so don't push it to git
4. **Use the right config** - Use `ENV_CONFIG` for app settings, `API_CONFIG` for endpoints

## Common Mistakes to Avoid

- ❌ Hardcoding URLs like `'http://localhost:3001/api'` in components
- ❌ Forgetting to create `.env.local` file
- ❌ Committing `.env.local` to git
- ❌ Using wrong config object for the wrong purpose

## Need Help?

If you're not sure which config to use:
- **App settings** (URLs, timeouts, app name) → Use `ENV_CONFIG`
- **API endpoints** (login, products, orders) → Use `API_CONFIG`

That's it! The config folder is pretty straightforward once you get the hang of it. 😊
