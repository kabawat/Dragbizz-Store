// Exercise first-render UI and request ordering without live services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const babel = require('next/dist/compiled/babel/core');
function load(relative, stubs) {
 const filename = path.resolve(__dirname, '..', relative);
 const code = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
  filename, configFile: false, babelrc: false,
  presets: [[require('next/babel'), { 'preset-env': { targets: { node: 'current' }, modules: 'commonjs' } }]],
 }).code;
 const module = { exports: {} };
 new Function('require', 'module', 'exports', code)(name => name in stubs ? stubs[name] : require(name), module, module.exports);
 return module.exports;
}
const ui = {
 PageLoader: () => React.createElement("div", null, "SKELETON"),
 PageSkeleton: () => React.createElement('div', null, 'SKELETON'),
 EmptyState: () => React.createElement('div', null, 'EMPTY'),
 AccessRestricted: () => React.createElement('div', null, 'RESTRICTED'),
};
const { CustomersScreen } = load('../dragorbit/features/src/customers/screen/CustomersScreen.jsx', { '@dragorbit/ui': ui });
function screen(props) {
 return renderToStaticMarkup(React.createElement(CustomersScreen, { t: k => k, customers: [], isLoading: false, hasLoaded: false, CustomerListHeader: () => null, CustomerListContent: () => 'CUSTOMERS', ...props }));
}
assert.match(screen({}), /SKELETON/);
assert.doesNotMatch(screen({}), /EMPTY/);
assert.match(screen({ hasLoaded: true }), /EMPTY/);
assert.match(screen({ hasLoaded: true, customers: [{ id: 'one' }] }), /CUSTOMERS/);
assert.doesNotMatch(screen({ customers: [{ id: 'old-store' }] }), /CUSTOMERS/);
let subscription = { isLoading: true, subscription: null };
const { PermissionGuard } = load('src/components/auth/PermissionGuard.jsx', {
 '@dragorbit/ui/app': ui,
 'next/navigation': { usePathname: () => '/dashboard/customers', useRouter: () => ({ push() {} }) },
 '@/contexts/SubscriptionContext': { useSubscription: () => subscription },
 '@/data/config/moduleRegistry': { getModuleFromPath: () => 'customer', getActionFromPath: () => 'read', getCapabilityFromPath: () => null },
 '@/hooks/permissions/useModulePermissions': { ROLES: { OWNER: 'OWNER' } },
 '@/store/slices/profileSlice': { getStaffProfileDetails: () => ({type: 'staff/retry'}) },
 '@/store/hooks': { useAppDispatch: () => () => {}, useAppSelector: callback => callback({ profile: { isAuthenticated: true, authProfile: { role: 'OWNER' }, authProfileLoading: false, staffProfileLoading: false } }) },
 '@/utils/helper/domain': { redirectToMainDomain() {} },
 '@/utils/subscriptionCapability.util': { hasFeatureCapability: () => true },
});
function guard() { return renderToStaticMarkup(React.createElement(PermissionGuard, null, 'PAGE')); }
assert.match(guard(), /SKELETON/);
assert.doesNotMatch(guard(), /RESTRICTED/);
subscription = { isLoading: false, subscription: { features: [{ module: 'customer', usageType: 'UNLIMITED' }] } };
assert.equal(guard(), 'PAGE');
subscription = { isLoading: false, subscription: null };
assert.match(guard(), /RESTRICTED/);
// Provider is pending on its very first render, before its fetch effect starts.
const context = load('src/contexts/SubscriptionContext.jsx', {
 '@/store/hooks': { useAppSelector: fn => fn({profile:{}}) },
 '@/utils/workspaceCache': { workspaceScope: () => null, readPlanPreview: () => null, savePlanPreview() {} },
 '@/utils/responseHandler/success': { handleSuccess: v => v },
 'next/navigation': { usePathname: () => '/dashboard/customers' },
 '@/components/subscription/SubscriptionUpgradeModal': { default: () => null, __esModule: true },
 '@/service/retailer': { subscriptionService: { getSubscription() {} } },
 '@/hooks/useApiResponse': { default: () => ({ execute: async () => ({ success: true }), data: null, loading: false }), __esModule: true },
 '@/utils/subscriptionCapability.util': { isKhataFreeSubscription: () => false },
});
function Readiness() { return context.useSubscription().isLoading ? 'PENDING' : 'READY'; }
assert.equal(renderToStaticMarkup(React.createElement(context.SubscriptionProvider, null, React.createElement(Readiness))), 'PENDING');
// The reducer accepts only the latest fresh query result.
const slice = load('src/store/slices/customers/customerSlice.js', {
 '@/service': { customerService: {} }, '@/utils/responseHandler/success': { handleSuccess: v => v }, '@/utils/responseHandler/error': { handleError: v => v },
});
const reducer = slice.default, fetch = slice.getCustomers;
let state = reducer(undefined, { type: 'init' });
assert.equal(state.hasLoaded, false);
const first = { store: 'store-a', isFreshLoad: true };
const second = { store: 'store-a', search: 'new', isFreshLoad: true };
state = reducer(state, fetch.pending('first', first));
state = reducer(state, fetch.pending('second', second));
state = reducer(state, fetch.fulfilled({ data: [{ _id: 'old' }] }, 'first', first));
assert.equal(state.hasLoaded, false);
state = reducer(state, fetch.fulfilled({ data: [{ _id: 'new' }] }, 'second', second));
assert.equal(state.hasLoaded, true);
assert.equal(state.customers[0].id, 'new');
console.log('Customer loading, subscription first-render and stale-response regressions passed.');
