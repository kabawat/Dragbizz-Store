# Production Readiness: Issues & Improvement Checklist 🚀

Below is a detailed list of identified issues and proposed improvements for the **DragBizz Store FE** project before moving to production.

---

## 1. Performance & Optimization

### [x] Heavy Calculation Memoization
*   **Issue**: In components like `PricingGSTSection.jsx`, heavy price and GST calculations are performed on every render (on every keystroke).
*   **Fix**: Wrapped calculations in `useMemo` hooks.
*   **Status**: Fixed in PricingGSTSection.jsx 🚀

### [x] Asset Prefetching Control
*   **Issue**: Default Next.js prefetching was preloading unnecessary CSS/JS chunks for modules the user might not have access to, causing console warnings and bandwidth waste.
*   **Fix**: Implemented `prefetch={false}` in `SidebarNavItem.jsx`, `SidebarFlyout.jsx`, and `SortableComponents.jsx`. Chunks now load only on user interaction. 🚀

---

## 2. Code Maintainability (DRY)

### [x] Centralized Module Mapping
*   **Issue**: The mapping between routes and modules (e.g., `/dashboard/invoices` -> `invoice`) is duplicated in `PermissionGuard.jsx`, `SidebarNavItem.jsx`, and potentially `GlobalHotkeys.jsx`.
*   **Fix**: Created `src/data/config/moduleRegistry.js` as the single source of truth for all module keys and route mappings. 🚀

### [x] Unified Helper Functions
*   **Issue**: Logic for checking module status in subscription is implemented multiple times.
*   **Fix**: Standardized on `useSubscriptionAccess` hook and centralized path-to-module logic in the registry. 🚀

---

## 3. UI / UX Improvements

### [ ] Loading States (Skeletons)
*   **Issue**: `PermissionGuard` and other components return `null` or simple spinners while loading data.
*   **Fix**: Implement Skeleton screens (using Framer Motion or simple CSS shimmers) to give a more "premium" feel.

### [ ] Error Boundaries
*   **Issue**: If a specific module (like Analytics or Invoices) crashes due to unexpected data, the entire dashboard might crash.
*   **Fix**: Implement React Error Boundaries around main module containers to isolate failures.

### [ ] CSS Utility Typos
*   **Issue**: Some inline styles have potential syntax issues with CSS variables, e.g., `bg-[rgb(var(--color-primary)/0.8)]`.
*   **Fix**: Update to standard syntax: `bg-[rgb(var(--color-primary)_/_0.8)]`.

---

## 4. Security & Validation

### [x] Form Input Sanitization
*   **Issue**: Price inputs allowed `parseFloat` without strict validation for non-numeric characters.
*   **Fix**: Implemented strict regex-based validation (`/^-?\d*\.?\d*$/`) in `Input.jsx` to reject invalid numeric formats immediately. 🚀

### [x] Backend Sync Check
*   **Issue**: UI might not handle API-level subscription blocks gracefully.
*   **Fix**: Added a global Axios interceptor in `axiosConfig.js` to handle `403 Forbidden` errors by redirecting to the dashboard for access re-validation. 🚀

---

## 5. Accessibility (a11y)

### [x] Keyboard Navigation
*   **Issue**: Modals like `SubscriptionUpgradeModal` need to be checked for "Escape" key closure.
*   **Fix**: Added Global "Escape" key listener to `SubscriptionUpgradeModal.jsx`. 🚀

### [x] Aria Labels
*   **Issue**: Icons (Crown, Shield) lacked proper labels.
*   **Fix**: Added `role="img"` and `aria-label` to all critical restricted-access icons. Hidden decorative particles using `aria-hidden`. 🚀
