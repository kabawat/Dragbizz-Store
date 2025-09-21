/**
 * Clear browser history completely
 */
export const clearBrowserHistory = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Replace current history entry
    window.history.replaceState(null, '', '/');
    
    // Clear all history entries
    const historyLength = window.history.length;
    if (historyLength > 1) {
      window.history.go(-(historyLength - 1));
    }
    
    // Force replace current page
    window.history.replaceState(null, '', window.location.href);
    
    return true;
  } catch (error) {
    console.error('History clearing error:', error);
    return false;
  }
};

/**
 * Force page reload with replacement
 */
export const forcePageReload = (url = '/') => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear history first
    window.history.replaceState(null, '', url);
    
    // Force page replacement
    window.location.replace(url);
    
    return true;
  } catch (error) {
    console.error('Page reload error:', error);
    return false;
  }
};
