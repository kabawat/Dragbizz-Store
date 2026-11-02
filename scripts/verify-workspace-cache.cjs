const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const babel = require("next/dist/compiled/babel/core");
const { configureStore } = require("@reduxjs/toolkit");
const root = path.resolve(__dirname, "..");
function load(relative, stubs = {}) {
  const filename = path.resolve(root, relative);
  const code = babel.transformSync(fs.readFileSync(filename, "utf8"), {
    filename,
    configFile: false,
    babelrc: false,
    presets: [
      [
        require("next/babel"),
        { "preset-env": { targets: { node: "current" }, modules: "commonjs" } },
      ],
    ],
  }).code;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => (name in stubs ? stubs[name] : require(name)),
    module,
    module.exports
  );
  return module.exports;
}
const storage = new Map();
global.window = {
  location: { origin: "https://demo.dragbizz.com" },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
};
const cache = load("src/utils/workspaceCache.js");
const account = {
  _id: "user-a",
  agencyId: "agency-a",
  role: "store_owner",
  tenant: "demo",
  accessToken: "DO_NOT_PERSIST",
};
const store = { storeId: "123456789012345678901234", storeName: "Demo" };
const profile = {
  authProfile: account,
  user: { name: "Owner", password: "DO_NOT_PERSIST" },
  agency: { _id: "agency-a", agencyName: "Demo" },
  stores: [store],
  selectedStore: store,
  sessionVerified: true,
};
const plan = {
  features: [{ module: "customer", maxLimit: 0, usageType: "LIMITED" }],
};
cache.saveWorkspacePreview(profile);
cache.savePlanPreview(cache.workspaceScope(profile), plan);
assert.equal(cache.readWorkspacePreview().agency.agencyName, "Demo");
assert.deepEqual(
  cache.readPlanPreview(cache.workspaceScope(profile)).subscription,
  plan
);
assert.doesNotMatch([...storage.values()].join(""), /DO_NOT_PERSIST/);
assert.equal(cache.readPlanPreview("different-user"), null);
const now = Date.now;
Date.now = () => now() + 25 * 60 * 60 * 1000;
assert.equal(cache.readWorkspacePreview(), null);
assert.equal(cache.readPlanPreview(cache.workspaceScope(profile)), null);
Date.now = now;
let authValue = { success: true, data: account },
  authCalls = 0,
  workspaceCalls = 0;
const core = require("../../dragorbit/core/src/api/runtime.cjs");
const actions = load("src/store/slices/profileSlice.js", {
  "@/service/auth": {
    authService: {
      getProfile: async () => {
        authCalls++;
        return authValue;
      },
    },
  },
  "@/service/retailer": {
    storeService: {
      getRetailerProfile: async () => {
        workspaceCalls++;
        return {
          success: true,
          data: { agency: profile.agency, stores: profile.stores },
        };
      },
    },
  },
  "@/service/retailer/staff.service": {
    __esModule: true,
    default: {
      getStaffProfile: async () => ({
        success: true,
        data: { permissions: [] },
      }),
    },
  },
  "@/utils/responseHandler/success": { handleSuccess: core.handleSuccess },
  "@/utils/responseHandler/error": { handleError: core.handleError },
  "@/utils/store.util": load("src/utils/store.util.js"),
  "@/utils/workspaceCache": cache,
});
(async () => {
  const { bootstrapSession } = await import(
    pathToFileURL(path.resolve(root, "../dragorbit/core/src/auth/index.js"))
  );
  let app = configureStore({ reducer: { profile: actions.default } });
  app.dispatch(actions.restoreShellPreview(cache.readWorkspacePreview()));
  assert.equal(app.getState().profile.shellRestored, true);
  assert.equal(app.getState().profile.isAuthenticated, false);
  assert.equal(app.getState().profile.sessionVerified, false);
  await bootstrapSession(app, actions, { sessionHint: true, force: true });
  assert.equal(authCalls, 1);
  assert.equal(workspaceCalls, 1);
  assert.equal(app.getState().profile.sessionVerified, true);
  app.dispatch(actions.clearAuth());
  assert.equal(storage.size, 0);
  assert.equal(app.getState().profile.shellRestored, false);
  cache.saveWorkspacePreview(profile);
  cache.savePlanPreview(cache.workspaceScope(profile), plan);
  app = configureStore({ reducer: { profile: actions.default } });
  app.dispatch(actions.restoreShellPreview(cache.readWorkspacePreview()));
  authValue = {
    success: true,
    data: { ...account, _id: "user-b", agencyId: "agency-b" },
  };
  await app.dispatch(actions.getAuthProfile());
  assert.equal(app.getState().profile.agency, null);
  assert.equal(app.getState().profile.stores.length, 0);
  assert.equal(storage.size, 0);
  assert.equal(app.getState().profile.sessionVerified, false);
  cache.saveWorkspacePreview(profile);
  app = configureStore({ reducer: { profile: actions.default } });
  app.dispatch(actions.restoreShellPreview(cache.readWorkspacePreview()));
  authValue = { success: false, statusCode: 401, message: "Expired" };
  await app.dispatch(actions.getAuthProfile());
  assert.equal(storage.size, 0);
  assert.equal(app.getState().profile.authProfile, null);
  storage.set("dragbizz:workspace-preview:v1", "{bad-json");
  assert.equal(cache.readWorkspacePreview(), null);
  window.localStorage.getItem = () => {
    throw new Error("Storage blocked");
  };
  assert.equal(cache.readWorkspacePreview(), null);
  console.log(
    "PASS: scoped presentation/plan cache, token exclusion, expiry, live revalidation, account change, logout, expired session and unavailable storage."
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
