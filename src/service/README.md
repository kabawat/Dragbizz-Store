# Service Layer - API Calls Made Easy

Hey there! This folder handles all the communication between our frontend and backend. Think of it as the "messenger" that sends requests to our server and brings back responses.

## What's This For?

The service layer is responsible for:
- Making API calls to our backend server
- Handling user authentication automatically
- Managing login tokens
- Redirecting users when they're not logged in

## What's Inside?

### `config/axiosConfig.js` - The HTTP Client Setup
This file creates two types of HTTP clients for different purposes.

#### `authAxios` - For Protected Pages
**What it does:** Makes API calls that need user login
**When to use:** User profile, orders, settings, any page that requires login

**How it works:**
- Automatically adds your login token to every request
- If your token is expired or invalid, it clears your login and redirects you to the login page
- Perfect for pages where users need to be logged in

#### `unauthAxios` - For Public Pages  
**What it does:** Makes API calls that don't need user login
**When to use:** Login page, register page, forgot password, public content

**How it works:**
- Makes requests without any login token
- Used for authentication pages and public content
- No automatic redirects or token management

### `index.js` - The Export File
This file makes the HTTP clients available to other parts of the app.

**What it does:** Exports `authAxios` and `unauthAxios` so other files can import and use them

## How to Use These

### First, Import What You Need
```javascript
import { authAxios, unauthAxios } from '@/service';
```

### For Login/Register (No Authentication Needed)
```javascript
// User login
const loginUser = async (email, password) => {
  try {
    const response = await unauthAxios.post('/auth/login', { 
      email, 
      password 
    });
    return response.data;
  } catch (error) {
    console.log('Login failed:', error.message);
    throw error;
  }
};

// User registration
const registerUser = async (userData) => {
  try {
    const response = await unauthAxios.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.log('Registration failed:', error.message);
    throw error;
  }
};
```

### For Protected Pages (Authentication Required)
```javascript
// Get user profile
const getUserProfile = async () => {
  try {
    const response = await authAxios.get('/user/profile');
    return response.data;
  } catch (error) {
    console.log('Failed to get profile:', error.message);
    throw error;
  }
};

// Update user profile
const updateProfile = async (profileData) => {
  try {
    const response = await authAxios.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.log('Failed to update profile:', error.message);
    throw error;
  }
};
```

## What Happens Behind the Scenes?

### When You Use `unauthAxios`:
1. Sends request to the server
2. Server processes the request
3. Returns response back to you
4. If there's an error, shows the error message

### When You Use `authAxios`:
1. Gets your login token from cookies
2. Adds the token to the request header
3. Sends request to the server
4. If your token is invalid/expired:
   - Clears your login data
   - Redirects you to the login page
5. Returns response back to you

## Environment Variables Used

The service layer uses these environment variables:
- `NEXT_PUBLIC_API_URL` - Your backend server URL (default: http://localhost:3001/api)
- `NEXT_PUBLIC_API_TIMEOUT` - How long to wait for response (default: 10 seconds)

## Quick Rules to Remember

1. **Use `unauthAxios` for:** login, register, forgot password, public pages
2. **Use `authAxios` for:** user profile, orders, settings, any page that needs login
3. **Always wrap in try-catch** - Handle errors properly
4. **Check response success** - Make sure the request worked before using data

## Common Examples

### Login Form
```javascript
const handleLogin = async (formData) => {
  try {
    const result = await unauthAxios.post('/auth/login', formData);
    if (result.data.success) {
      // Login successful, redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    // Show error message to user
    setError('Login failed. Please try again.');
  }
};
```

### Protected Data Fetching
```javascript
const fetchUserOrders = async () => {
  try {
    const response = await authAxios.get('/user/orders');
    setOrders(response.data.orders);
  } catch (error) {
    // User will be automatically redirected to login if not authenticated
    console.log('Failed to fetch orders');
  }
};
```

## Troubleshooting

**Problem:** Getting 401 errors
**Solution:** Check if user is properly logged in

**Problem:** Requests timing out
**Solution:** Check if your backend server is running

**Problem:** CORS errors
**Solution:** Make sure your backend has proper CORS settings

## Need Help?

- **For public pages** (login, register) → Use `unauthAxios`
- **For protected pages** (profile, orders) → Use `authAxios`
- **Always handle errors** → Wrap requests in try-catch blocks

That's it! The service layer makes API calls super easy. Just pick the right axios instance and you're good to go! 🚀
