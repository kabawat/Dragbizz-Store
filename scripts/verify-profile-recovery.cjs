const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('next/dist/compiled/babel/core');
const { configureStore } = require('@reduxjs/toolkit');
function load(relative, stubs) {
 const filename = path.resolve(__dirname, '..', relative);
 const code = babel.transformSync(fs.readFileSync(filename, 'utf8'), { filename, configFile: false, babelrc: false, presets: [[require('next/babel'), { 'preset-env': { targets: { node: 'current' }, modules: 'commonjs' } }]] }).code;
 const module = { exports: {} };
 new Function('require','module','exports',code)(name => name in stubs ? stubs[name] : require(name), module, module.exports);
 return module.exports;
}
let status = 429;
let retailerData = null;
const failure = () => { throw { response: { status } }; };
const profile = load('src/store/slices/profileSlice.js', {
 '@/service/auth': { authService: { getProfile: failure } },
 '@/service/retailer': { storeService: { getRetailerProfile: () => retailerData ? { data: retailerData } : failure() } },
 '@/service/retailer/staff.service': { default: {}, __esModule: true },
 '@/utils/responseHandler/error': { handleError: () => ({ message: 'Too many requests' }) },
 '@/utils/responseHandler/success': { handleSuccess: value => value },
 '@/utils/store.util': { isValidStoreId: Boolean, normalizeStoreSummary: value => value, pickStoreId: value => typeof value === 'string' ? value : value?.storeId ?? value?._id },
});
function store() { return configureStore({ reducer: { profile: profile.default } }); }
(async () => {
 let app = store();
 app.dispatch(profile.getAuthProfile.fulfilled({ data: { agencyId: 'agency', role: 'store_owner' } }, 'auth'));
 await app.dispatch(profile.getRetailerDetails({ forceRefresh: true }));
 assert.equal(app.getState().profile.redirectTo, null, '429 must not imply onboarding');
 assert.equal(app.getState().profile.retailerErrorStatus, 429);
 assert.equal(app.getState().profile.isAuthenticated, true);
 app.dispatch(profile.getRetailerDetails.fulfilled({ data: { agency: { _id: 'agency' }, stores: [{ storeId: 'store' }] } }, 'cached'));
 await app.dispatch(profile.getRetailerDetails({ forceRefresh: true }));
 assert.equal(app.getState().profile.agency._id, 'agency');
 assert.equal(app.getState().profile.selectedStore.storeId, 'store');
 assert.equal(app.getState().profile.redirectTo, null);
 status = 401;
 await app.dispatch(profile.getRetailerDetails({ forceRefresh: true }));
 assert.equal(app.getState().profile.redirectTo, '/login');
 assert.equal(app.getState().profile.isAuthenticated, false);
 status = 429; app = store();
 await app.dispatch(profile.getAuthProfile());
 assert.equal(app.getState().profile.authProfileErrorStatus, 429);
 assert.equal(app.getState().profile.redirectTo, null);
 retailerData = { agency: null, stores: [] };
 await app.dispatch(profile.getRetailerDetails({ forceRefresh: true }));
 assert.equal(app.getState().profile.redirectTo, '/onboarding/agency', 'successful confirmation can require onboarding');
 const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
 const snapshot = { ...app.getState().profile, agency: null, stores: [], redirectTo: null, isAuthenticated: true, error: 'Too many requests', retailerErrorStatus: 429 };
 const { default: AuthGuard } = load('src/components/auth/AuthGuard.jsx', {
  '@dragorbit/ui/app': { StartupLoader: () => 'LOADING' },
  'next/navigation': { usePathname: () => '/dashboard/customers', useRouter: () => ({ replace() { throw Error('Unexpected redirect'); } }) },
  '@/hooks/store/useSelectedStoreId': { default: () => ({ ready: false }), __esModule: true },
  '@/store/hooks': { useAppSelector: callback => callback({ profile: snapshot }), useAppDispatch: () => app.dispatch },
  '@/store/slices/profileSlice': profile,
 });
 assert.match(renderToStaticMarkup(React.createElement(AuthGuard, null, 'PAGE')), /Unable to load your account/);
 console.log('429 initial-load, cached-profile preservation, recovery UI, 401 and confirmed-onboarding regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
