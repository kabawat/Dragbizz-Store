# Redux Toolkit Setup

This directory contains the Redux Toolkit setup for the DragBizz Store Frontend, integrated with your existing `authService`.

## Structure

```
src/store/
├── index.js              # Store configuration
├── provider.jsx          # Redux Provider component
├── hooks.js              # Typed Redux hooks
└── slices/
    ├── authSlice.js      # Authentication slice (uses authService)
    └── productSlice.js   # Product management slice
```

## Integration with AuthService

Redux actions are now integrated with your existing `authService`. This means:
- **API calls** are handled by `authService`
- **State management** is handled by Redux
- **Best of both worlds** - existing service + centralized state

## Usage

### 1. Basic Redux Usage

```javascript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, logoutUser } from '../store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  const handleLogin = () => {
    dispatch(loginUser({
      identifier: 'user@example.com',
      password: 'password123',
      useOtp: false,
      deviceId: 'web_device_123',
      platform: 'web',
      deviceToken: '',
      location: '0,0'
    }));
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {isAuthenticated ? `Welcome ${user?.firstName}` : 'Please login'}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### 2. Available Auth Actions

#### Login & Authentication
- `loginUser(credentials)` - Login with email/password
- `sendOTP(credentials)` - Send OTP for login
- `verifyLoginOTP(otpData)` - Verify OTP for login
- `logoutUser()` - Logout user

#### Registration
- `registerUser(userData)` - Register new user
- `verifyRegistrationOTP({otp, token})` - Verify registration OTP

#### Password Management
- `forgotPassword(identifier)` - Send password reset email
- `resetPassword(resetData)` - Reset password with token

#### State Management
- `setCredentials(payload)` - Set user credentials manually
- `clearCredentials()` - Clear user credentials
- `clearError()` - Clear error state
- `setRegistrationToken(token)` - Set registration token

### 3. Updated State Structure

#### Auth State
```javascript
{
  user: null,                    // User object
  token: null,                   // Auth service token
  retailerToken: null,           // Retailer service token
  isAuthenticated: false,        // Authentication status
  isLoading: false,              // Loading state
  error: null                    // Error message
}
```

### 4. Example Implementations

Check these example files for complete implementations:
- `src/examples/LoginWithRedux.jsx` - Login page with Redux
- `src/examples/RegisterWithRedux.jsx` - Register page with Redux
- `src/examples/AuthComponents.jsx` - Logout, ProtectedRoute, AuthStatus components

### 5. Key Benefits

1. **Centralized State**: All auth state in one place
2. **Automatic Token Management**: Tokens stored in localStorage automatically
3. **Error Handling**: Centralized error handling
4. **Loading States**: Built-in loading states for all actions
5. **Type Safety**: Typed hooks for better development experience

### 6. Migration from Direct AuthService

**Before (Direct AuthService):**
```javascript
const result = await authService.login(credentials);
if (result.success) {
  // Handle success manually
  localStorage.setItem('token', result.data.token);
  setUser(result.data.user);
}
```

**After (Redux):**
```javascript
dispatch(loginUser(credentials));
// State automatically updated, tokens stored, user set
```

## Installation Required

Make sure to install these packages:

```bash
npm install @reduxjs/toolkit react-redux
```

or

```bash
yarn add @reduxjs/toolkit react-redux
```

## Next Steps

1. Install the required packages
2. Replace your existing login/register pages with Redux versions
3. Add logout functionality to your dashboard
4. Use `ProtectedRoute` component for protected pages
5. Add `AuthStatus` component to show user info
