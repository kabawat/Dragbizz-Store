# TODO - DragBizz Store Frontend


## 🚨 CRITICAL PRIORITY (Do Immediately)

### Error Handling & Code Quality
- [ ] Remove hardcoded development headers
  - [ ] `src/service/config/axiosConfig.js` - Remove `ngrok-skip-browser-warning` header from production builds

- [ ] Add React Error Boundaries
  - [ ] Create `ErrorBoundary` component
  - [ ] Wrap main app sections with ErrorBoundary
  - [ ] Add error fallback UI

---

## 🔴 HIGH PRIORITY (Do Soon)

### Testing Infrastructure
- [ ] Set up testing framework
  - [ ] Install Jest + React Testing Library
  - [ ] Configure test environment
  - [ ] Create test utilities and helpers
  - [ ] Write unit tests for critical components
    - [ ] Service layer tests
    - [ ] Utility functions tests
    - [ ] Redux slice tests
    - [ ] Custom hooks tests
  - [ ] Write integration tests for key flows
    - [ ] Authentication flow
    - [ ] Customer CRUD operations
    - [ ] Invoice generation
  - [ ] Set up test coverage reporting

### Error Handling Standardization
- [ ] Standardize error handling approach
  - [ ] Choose one error handling pattern (useErrorHandler vs errorHandler.js)
  - [ ] Document error handling guidelines
  - [ ] Refactor all components to use standardized approach
  - [ ] Create error handling utility functions

### Code Refactoring
- [ ] Break down large components
  - [ ] `src/components/customer/CustomerDownloadDrawer.jsx` (619 lines) - Split into smaller components
  - [ ] `src/page/dashboard/bills/view/index.jsx` (663 lines) - Extract sub-components
  - [ ] `src/page/dashboard/customers/view/index.jsx` (889 lines) - Refactor into smaller pieces
  - [ ] `src/page/dashboard/suppliers/view/index.jsx` (1043 lines) - Break into modules
  - [ ] `src/page/login/index.jsx` (874 lines) - Split into steps/components

- [ ] Remove duplicate code
  - [ ] Create shared date formatting utility
  - [ ] Create shared currency formatting utility
  - [ ] Consolidate duplicate validation logic
  - [ ] Extract common API call patterns

### Architecture Cleanup
- [ ] Resolve duplicate page structure
  - [ ] Decide: Use `app/` directory (App Router) OR `page/` directory (Pages Router)
  - [ ] Migrate all pages to chosen approach
  - [ ] Remove unused directory structure
  - [ ] Update routing configuration

- [ ] Standardize service layer
  - [ ] Review all service files
  - [ ] Choose: Class-based OR Function-based services
  - [ ] Refactor all services to use chosen pattern
  - [ ] Document service layer patterns

---

## 🟡 MEDIUM PRIORITY (Important Improvements)

### Performance Optimization
- [ ] Implement code splitting
  - [ ] Use dynamic imports for large components
  - [ ] Lazy load routes
  - [ ] Split vendor bundles
  - [ ] Analyze bundle size with webpack-bundle-analyzer

- [ ] Optimize Redux state management
  - [ ] Install and configure `reselect` for memoized selectors
  - [ ] Review Redux slices for unnecessary re-renders
  - [ ] Implement proper state normalization
  - [ ] Add Redux DevTools configuration

- [ ] API call optimization
  - [ ] Implement request deduplication
  - [ ] Add response caching strategy
  - [ ] Implement request cancellation for stale requests
  - [ ] Add request queue management

- [ ] Component optimization
  - [ ] Add React.memo where appropriate
  - [ ] Use useMemo and useCallback for expensive operations
  - [ ] Review useEffect dependencies
  - [ ] Optimize re-renders

### Security Enhancements
- [ ] Middleware improvements
  - [ ] Add rate limiting
  - [ ] Implement CSRF protection
  - [ ] Add request logging
  - [ ] Add IP blocking for suspicious activity

- [ ] Input validation & sanitization
  - [ ] Verify dompurify usage for all user inputs
  - [ ] Add input validation on client side
  - [ ] Review XSS vulnerabilities
  - [ ] Add SQL injection prevention (if applicable)

- [ ] Security headers
  - [ ] Add security headers in Next.js config
  - [ ] Implement Content Security Policy (CSP)
  - [ ] Add X-Frame-Options
  - [ ] Configure HTTPS redirects

### Code Quality Improvements
- [ ] Enable strict mode
  - [ ] Update `jsconfig.json` - Set `"strict": true`
  - [ ] Fix all strict mode errors
  - [ ] Consider migrating to TypeScript

- [ ] Import organization
  - [ ] Install ESLint import ordering plugin
  - [ ] Configure import order rules
  - [ ] Fix import order in all files
  - [ ] Remove unused imports

- [ ] Code documentation
  - [x] Replace multi-line comments with single-line comments - COMPLETED
  - [ ] Document component props
  - [ ] Add inline comments for complex logic
  - [ ] Update README with setup instructions

---

## 🟢 LOW PRIORITY (Nice to Have)

### TypeScript Migration
- [ ] Plan TypeScript migration
  - [ ] Create migration strategy
  - [ ] Start with utility functions
  - [ ] Migrate components gradually
  - [ ] Add type definitions for API responses
  - [ ] Configure TypeScript strict mode

### Advanced Features
- [ ] E2E Testing
  - [ ] Set up Playwright or Cypress
  - [ ] Write E2E tests for critical user flows
  - [ ] Add visual regression testing

- [ ] Performance Monitoring
  - [ ] Integrate performance monitoring (e.g., Web Vitals)
  - [ ] Set up error tracking (Sentry)
  - [ ] Add analytics for user behavior
  - [ ] Monitor API response times

- [ ] Accessibility (A11y)
  - [ ] Audit accessibility with axe DevTools
  - [ ] Add ARIA labels where needed
  - [ ] Ensure keyboard navigation
  - [ ] Test with screen readers

- [ ] PWA Features
  - [ ] Add service worker
  - [ ] Implement offline support
  - [ ] Add push notifications (if needed)
  - [ ] Create manifest.json

### Developer Experience
- [ ] Development tools
  - [ ] Add pre-commit hooks (Husky)
  - [ ] Configure lint-staged
  - [ ] Add commit message linting
  - [ ] Set up CI/CD pipeline

- [ ] Documentation
  - [ ] Create component storybook
  - [ ] Document API integration patterns
  - [ ] Add architecture decision records (ADRs)
  - [ ] Create developer onboarding guide

---

## 📋 SPECIFIC FILE-LEVEL TASKS


### `src/service/config/axiosConfig.js`
- [ ] Remove ngrok header from production
- [ ] Add environment-based header configuration
- [ ] Improve error handling in interceptors
- [ ] Add request/response logging (dev only)

### `src/middleware.js`
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Improve error handling
- [ ] Add security headers

### `src/store/slices/`
- [ ] Review all 11 slices for optimization
- [ ] Add memoized selectors with reselect
- [ ] Normalize state structure
- [ ] Add unit tests for each slice

### `src/components/ui/`
- [ ] Review all 41 UI components
- [ ] Ensure consistent prop interfaces
- [ ] Add Storybook stories
- [ ] Add accessibility attributes

---

## 🔄 ONGOING MAINTENANCE

### Code Review Checklist
- [x] No console statements in production code
- [x] All catch blocks have proper error handling
- [ ] No hardcoded values (use config)
- [ ] All components have proper error boundaries
- [ ] No duplicate code
- [ ] Proper TypeScript types (if using TS)
- [ ] All imports are organized
- [ ] No unused variables/imports

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and fix security vulnerabilities
- [ ] Monitor bundle size
- [ ] Review error logs
- [ ] Update documentation
- [ ] Code refactoring sessions

---

## 📊 METRICS TO TRACK

- [ ] Test coverage (aim for >80%)
- [ ] Bundle size (keep under 500KB initial load)
- [ ] Lighthouse score (aim for >90)
- [ ] Error rate (keep under 1%)
- [ ] API response time (keep under 500ms)
- [ ] Code complexity (reduce cyclomatic complexity)

---

## 📝 NOTES

- **Priority Legend:**
  - 🚨 Critical: Must fix before production
  - 🔴 High: Should fix soon
  - 🟡 Medium: Important but can wait
  - 🟢 Low: Nice to have

- **Status Legend:**
  - [ ] Not started
  - [🔄] In progress
  - [✅] Completed
  - [⏸️] Paused
  - [❌] Blocked

- **Last Updated:** 2026-01-20
- **Next Review Date:** Monthly

---

## 🎯 QUICK WINS (Start Here)

1. ✅ Fix empty catch blocks - COMPLETED
2. ✅ Remove console statements - COMPLETED (Logger implemented)
3. ✅ Fix syntax errors - COMPLETED
4. ✅ Remove/Replace multi-line comments - COMPLETED
5. [ ] Add Error Boundaries (1 hour)
6. [ ] Remove ngrok header (5 minutes)

**Remaining Quick Wins: ~1 hour**

---

## 📚 RESOURCES

- [Next.js Best Practices](https://nextjs.org/docs)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Redux Toolkit Best Practices](https://redux-toolkit.js.org/usage/usage-guide)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)

