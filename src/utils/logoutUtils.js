// Comprehensive Logout Utility
// File: src/utils/logoutUtils.js

/**
 * Comprehensive logout utility that clears all possible authentication data
 */
export const clearAllAuthData = () => {
  try {
    // Clear localStorage
    const storageKeys = [
      'authToken',
      'db_session_id',
    ];

    storageKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any remaining auth-related keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (
        key.toLowerCase().includes('session') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('db_')
      )) {
        localStorage.removeItem(key);
      }
    }

    // Clear sessionStorage completely
    sessionStorage.clear();

    const domain = window.location.hostname;
    const path = '/';

    storageKeys.forEach(cookieName => {
      // Clear cookie for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
    });

    // Clear IndexedDB if it exists
    if (window.indexedDB) {
      try {
        indexedDB.deleteDatabase('auth');
        indexedDB.deleteDatabase('session');
        indexedDB.deleteDatabase('user');
      } catch (e) {
        console.log('IndexedDB cleanup failed:', e);
      }
    }

    console.log('All authentication data cleared successfully');
    return true;

  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Complete logout process with Redux dispatch
 */
export const performCompleteLogout = async (dispatch, logoutUserAction) => {
  try {
    // Clear all auth data
    await dispatch(logoutUserAction());
    
    // Clear browser history
    if (typeof window !== 'undefined') {
     // Force page replacement (not navigation)
      setTimeout(() => {
        window.location.replace('/');
      }, 100);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Complete logout error:', error);
    
    // Force redirect even on error
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
    
    return { success: false, error };
  }
};

