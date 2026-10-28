const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const babel = require("next/dist/compiled/babel/core");
const { configureStore } = require("@reduxjs/toolkit");
const root = path.resolve(__dirname, "..");
const core = require("../../dragorbit/core/src/api/runtime.cjs");
function load(file, stubs = {}) {
  const code = babel.transformSync(fs.readFileSync(file, "utf8"), {
    filename: file,
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
const validProfile = {
  _id: "user",
  agencyId: "agency",
  role: "store_owner",
  tenant: "demo",
};
const workspace = {
  agency: { _id: "agency" },
  stores: [{ storeId: "123456789012345678901234" }],
};
function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
(async () => {
  const {
    bootstrapSession,
    sessionDecision,
    hasSessionHint,
    createSessionRecovery,
  } = await import(
    pathToFileURL(path.resolve(root, "../dragorbit/core/src/auth/index.js"))
  );
  assert(hasSessionHint("theme=dark; logged_in=true"));
  assert(!hasSessionHint("not_logged_in=true"));
  for (const status of [401, 429, 503])
    assert.throws(
      () =>
        core.handleSuccess({
          success: false,
          statusCode: status,
          message: "failed",
        }),
      (e) => e.response.status === status
    );
  assert.throws(() =>
    core.handleSuccess({
      status: 200,
      data: { status: false, message: "failed" },
    })
  );
  assert.equal(core.handleSuccess({ success: true, data: null }).data, null);
  for (const project of ["Dragbizz-Store", "DragBizz-Web"]) {
    let authCalls = 0,
      retailerCalls = 0,
      staffCalls = 0,
      authValue = { success: true, data: validProfile },
      retailerValue = { data: workspace };
    const authService = {
      async getProfile() {
        authCalls++;
        return await authValue;
      },
    };
    const storeService = {
      async getRetailerProfile() {
        retailerCalls++;
        return await retailerValue;
      },
    };
    const profile = load(
      path.resolve(root, "..", project, "src/store/slices/profileSlice.js"),
      {
        "@/service/auth": { authService },
        "@/service/retailer": { storeService },
        "@/service/retailer/staff.service": {
          default: {
            async getStaffProfile() {
              staffCalls++;
              return { data: { permissions: [] } };
            },
          },
          __esModule: true,
        },
        "@/utils/responseHandler/success": {
          handleSuccess: core.handleSuccess,
        },
        "@/utils/responseHandler/error": { handleError: core.handleError },
        "@/utils/workspaceCache": load(
          path.join(root, "src/utils/workspaceCache.js")
        ),
        "@/utils/store.util": load(path.join(root, "src/utils/store.util.js")),
      }
    );
    const makeStore = () =>
      configureStore({ reducer: { profile: profile.default } });
    let app = makeStore();
    await bootstrapSession(app, profile, { sessionHint: false });
    assert.equal(authCalls, 0);
    assert.equal(retailerCalls, 0);
    assert.equal(
      sessionDecision(app.getState().profile, {
        guest: true,
        sessionHint: false,
      }).state,
      "ready"
    );
    assert.equal(sessionDecision(app.getState().profile).state, "redirect");
    app = makeStore();
    const one = bootstrapSession(app, profile, { sessionHint: true }),
      two = bootstrapSession(app, profile, { sessionHint: true });
    assert.equal(one, two);
    await one;
    assert.equal(authCalls, 1);
    assert.equal(retailerCalls, 1);
    assert.equal(staffCalls, 0);
    assert.equal(sessionDecision(app.getState().profile).state, "ready");
    const staffApp = makeStore();
    authValue = { data: { ...validProfile, role: "store_staff" } };
    await bootstrapSession(staffApp, profile, { sessionHint: true });
    assert.equal(staffCalls, 1);
    assert.ok(staffApp.getState().profile.staffProfile);
    authValue = { data: validProfile };
    // A ready workspace remains ready while updating and after transient failure.
    const pending = deferred();
    authValue = pending.promise;
    const request = app.dispatch(profile.getAuthProfile());
    assert.equal(sessionDecision(app.getState().profile).state, "ready");
    pending.resolve({
      success: false,
      statusCode: 429,
      message: "Rate limited",
    });
    await request;
    assert.equal(app.getState().profile.isAuthenticated, true);
    assert.equal(sessionDecision(app.getState().profile).state, "ready");
    retailerValue = { success: false, statusCode: 503, message: "Unavailable" };
    await app.dispatch(profile.getRetailerDetails({ forceRefresh: true }));
    assert.equal(
      app.getState().profile.selectedStore.storeId,
      workspace.stores[0].storeId
    );
    assert.equal(sessionDecision(app.getState().profile).state, "ready");
    // Service failures must reject, never become authenticated empty profiles or onboarding.
    for (const status of [401, 429, 503]) {
      app = makeStore();
      authValue = { success: false, statusCode: status, message: "failed" };
      const result = await app.dispatch(profile.getAuthProfile());
      assert.equal(result.type, "profile/getAuthProfile/rejected");
      assert.equal(app.getState().profile.isAuthenticated, false);
      assert.equal(app.getState().profile.authProfile, null);
      assert.equal(app.getState().profile.authProfileErrorStatus, status);
      assert.equal(
        sessionDecision(app.getState().profile).state,
        status === 401 ? "redirect" : "error"
      );
    }
    app = makeStore();
    authValue = { success: true, data: validProfile };
    retailerValue = {
      success: false,
      statusCode: 429,
      message: "Rate limited",
    };
    await bootstrapSession(app, profile, { sessionHint: true });
    assert.equal(app.getState().profile.redirectTo, null);
    assert.equal(sessionDecision(app.getState().profile).state, "error");
    retailerValue = { data: workspace };
    await bootstrapSession(app, profile, { sessionHint: true, force: true });
    assert.equal(sessionDecision(app.getState().profile).state, "ready");
    // Late responses cannot log a user back in after sign-out.
    const late = deferred();
    authValue = late.promise;
    const old = app.dispatch(profile.getAuthProfile());
    app.dispatch(profile.clearAuth());
    late.resolve({ data: validProfile });
    await old;
    assert.equal(app.getState().profile.authProfile, null);
    app = makeStore();
    authValue = { data: { ...validProfile, agencyId: null } };
    await bootstrapSession(app, profile, { sessionHint: true });
    assert.equal(
      sessionDecision(app.getState().profile).to,
      "/onboarding/store"
    );
    app = makeStore();
    authValue = { data: validProfile };
    retailerValue = { data: { agency: workspace.agency, stores: [] } };
    await bootstrapSession(app, profile, { sessionHint: true });
    assert.equal(
      sessionDecision(app.getState().profile).to,
      "/onboarding/store"
    );
    app = makeStore();
    authValue = { data: {} };
    await bootstrapSession(app, profile, { sessionHint: true });
    assert.equal(sessionDecision(app.getState().profile).state, "error");
    console.log(
      `${project}: guest fast path, bootstrap dedup, transient errors, recovery, onboarding and logout races passed`
    );
  }
  let refreshes = 0,
    expired = 0;
  const refreshing = deferred();
  const recover = createSessionRecovery({
    refresh: () => {
      refreshes++;
      return refreshing.promise;
    },
    onExpired: () => expired++,
  });
  const errors = Array.from({ length: 5 }, () => ({
    response: { status: 401 },
    config: {},
  }));
  const jobs = errors.map((e) => recover(e, async (request) => request._retry));
  refreshing.resolve({ success: true });
  assert.deepEqual(await Promise.all(jobs), [true, true, true, true, true]);
  assert.equal(refreshes, 1);
  await assert.rejects(() =>
    recover(errors[0], () => {
      throw Error("second retry");
    })
  );
  for (const status of [429, 503, null, 401]) {
    const r = createSessionRecovery({
      refresh: async () => ({ success: false, statusCode: status }),
      onExpired: () => expired++,
    });
    await assert.rejects(() =>
      r({ response: { status: 401 }, config: {} }, () => {})
    );
  }
  assert.equal(
    expired,
    1,
    "Only a definitive invalid refresh session expires the UI"
  );
  console.log(
    "Concurrent 401 refresh/retry and 429/network preservation passed"
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
