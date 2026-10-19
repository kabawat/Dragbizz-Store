const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, ".."),
  shared = path.resolve(root, "../dragorbit");
const { build } = createRequire(
  path.resolve(root, "../dragbizz-desktop/package.json")
)("esbuild");
const {
  chromium,
} = require("/home/kheraj-suthar/.cache/ms-playwright-go/1.50.1/package");
const { compile } = require("@tailwindcss/node");
(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "session-ui-"));
  let browser;
  try {
    const appExports = [
      "AccessRestricted",
      "SessionGate",
      "SessionSkeleton",
      "DashboardSkeleton",
      "PageSkeleton",
      "DashboardShell",
    ]
      .map(
        (name) =>
          `export {${name}} from ${JSON.stringify(path.join(shared, "ui/src/components/app", `${name}.jsx`))};`
      )
      .join("\n");
    const mocks = {
      "@/contexts/ToastContext":
        "const noop=()=>{};export const useGlobalToast=()=>({showError:noop,showSuccess:noop});",
      "@/store/hooks":
        'export {useDispatch as useAppDispatch,useSelector as useAppSelector} from "react-redux";',
      "@/service/auth":
        "export const authService={getProfile:()=>new Promise(resolve=>window.__auth.push(resolve))};",
      "@/service/retailer":
        "export const storeService={getRetailerProfile:()=>new Promise(resolve=>window.__retailer.push(resolve))};",
      "@/service/retailer/staff.service":
        "export default {getStaffProfile:async()=>({data:{permissions:[]}})};",
      "@/components/auth/ForcePasswordModal": "export default ()=>null;",
      "@/contexts/HeaderContext":
        "export const HeaderProvider=({children})=>children;",
      "@/utils/helper/domain":
        "export const ensureSubdomain=()=>{};export const redirectToMainDomain=()=>{};",
      "@/contexts/SubscriptionContext":
        "export const useSubscription=()=>({subscription:window.__subLoading?null:{features:[]},isLoading:window.__subLoading,error:null,reload(){}});",
      "@/data/config/moduleRegistry":
        'export const getModuleFromPath=()=>null;export const getActionFromPath=()=>"view";export const getCapabilityFromPath=()=>null;',
      "@/hooks/permissions/useModulePermissions":
        'export const ROLES={OWNER:"store_owner",STAFF:"store_staff"};',
      "@/components/dashboard/sidebar":
        'import{useEffect}from"react";export default function Sidebar(){useEffect(()=>{window.__sidebarMounts++},[]);return <aside data-sidebar>Sidebar</aside>}',
      "@/components/dashboard/header":
        "export default ()=> <header data-header>Dashboard</header>;",
      "next/navigation":
        "export const usePathname=()=>window.__path;const router={replace:path=>window.__redirects.push(path)};export const useRouter=()=>router;",
      "@dragorbit/ui/app": appExports,
    };
    await build({
      stdin: {
        resolveDir: root,
        loader: "jsx",
        contents: `
 import React,{useEffect,useMemo,useState}from"react";import{createRoot}from"react-dom/client";import{Provider}from"react-redux";import{configureStore}from"@reduxjs/toolkit";
 import reducer,*as actions from"./src/store/slices/profileSlice.js";import Loader from"./src/components/GlobalProfileLoader.jsx";import Guard from"./src/components/auth/AuthGuard.jsx";import Layout from"./src/app/(routes)/dashboard/layout.jsx";import GuestGuard from"../DragBizz-Web/src/components/auth/GuestGuard.jsx";import{useDashboardData}from"../dragorbit/features/src/dashboard/hook/useDashboardData.js";import useApiResponse from"./src/hooks/useApiResponse.js";
 window.__auth=[];window.__retailer=[];window.__summaries=[];window.__redirects=[];window.__sidebarMounts=0;window.__contentMounts=0;window.__subLoading=true;
 const store=configureStore({reducer:{profile:reducer}});window.__store=store;window.__actions=actions;
 
 function Content(){const{execute}=useApiResponse();const repo=useMemo(()=>({getSummary:async()=>{const result=await execute(new Promise(resolve=>window.__summaries.push(resolve)),{showToast:false});return result.data;}}),[execute]);useEffect(()=>{window.__contentMounts++},[]);const{loading,summary}=useDashboardData({repository:repo,storeId:'123456789012345678901234',ready:true});return loading?<div aria-busy="true" data-metrics-skeleton>Loading metrics</div>:<div data-ready>Workspace ready {summary.length}<input aria-label="Draft filter"/></div>}
 function App(){const guest=new URLSearchParams(location.search).has('guest');window.__path=guest?'/login':'/dashboard';const[,render]=useState(0);window.__rerender=()=>render(v=>v+1);return <Provider store={store}><Loader initialSessionHint={!guest}/>{guest?<GuestGuard sessionHint={false}><form data-guest-form><input aria-label="Phone number"/></form></GuestGuard>:<Guard><Layout><Content/></Layout></Guard>}</Provider>}
 createRoot(document.getElementById('root')).render(<App/>);`,
      },
      bundle: true,
      jsx: "automatic",
      platform: "browser",
      alias: {
        "@dragorbit/core/auth": path.join(shared, "core/src/auth/index.js"),
        "@": path.join(root, "src"),
        react: path.dirname(require.resolve("react/package.json")),
        "react-dom": path.dirname(require.resolve("react-dom/package.json")),
      },
      define: { "process.env.NODE_ENV": '"production"' },
      outfile: path.join(temp, "app.js"),
      plugins: [
        {
          name: "boundary-mocks",
          setup(plugin) {
            plugin.onResolve({ filter: /.*/ }, (args) =>
              args.path in mocks
                ? { path: args.path, namespace: "mock" }
                : undefined
            );
            plugin.onLoad({ filter: /.*/, namespace: "mock" }, (args) => ({
              contents: mocks[args.path],
              loader: "jsx",
              resolveDir: root,
            }));
          },
        },
      ],
    });
    browser = await chromium.launch({
      executablePath: "/opt/google/chrome/chrome",
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("http://session.test/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<html><head></head><body><div id="root"></div></body></html>',
      })
    );
    const compiler = await compile('@import "tailwindcss";', {
      base: root,
      onDependency() {},
    });
    const start = async (url) => {
      await page.goto(url);
      await page.addStyleTag({
        content:
          ":root{--color-primary:100 65 255;--color-bg-primary:255 255 255;--color-bg-secondary:248 249 252;--color-bg-tertiary:235 237 242;--color-border-primary:220 222 230;--color-text-primary:24 24 32;--color-text-secondary:100 110 130;}",
      });
      await page.addScriptTag({
        content: fs.readFileSync(path.join(temp, "app.js"), "utf8"),
      });
    };
    const addStyles = async () => {
      const tokens = await page.evaluate(() => [
        ...new Set(
          [...document.querySelectorAll("[class]")].flatMap((el) => [
            ...el.classList,
          ])
        ),
      ]);
      await page.addStyleTag({ content: compiler.build(tokens) });
    };
    await start("http://session.test/?guest");
    await page.locator("[data-guest-form]").waitFor();
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.__auth.length), 0);
    assert.equal(await page.locator('[aria-busy="true"]').count(), 0);
    await page.getByLabel("Phone number").fill("9876543210");
    assert.equal(
      await page.getByLabel("Phone number").inputValue(),
      "9876543210"
    );
    await start("http://session.test/");
    await page.getByLabel("Loading workspace").waitFor({ state: "attached" });
    assert.equal(await page.locator("[data-sidebar]").count(), 0);
    assert.equal(await page.getByText(/Verifying|Securing/).count(), 0);
    await addStyles();
    await page.screenshot({ path: "/tmp/session-initial-skeleton.png" });
    await page.waitForFunction(() => window.__auth.length === 1);
    await page.evaluate(() =>
      window.__auth[0]({
        data: {
          _id: "user",
          agencyId: "agency",
          role: "store_owner",
          tenant: "demo",
        },
      })
    );
    await page.waitForFunction(() => window.__retailer.length === 1);
    assert.equal(await page.locator("[data-sidebar]").count(), 0);
    await page.evaluate(() =>
      window.__retailer[0]({
        data: {
          agency: { _id: "agency" },
          stores: [{ storeId: "123456789012345678901234" }],
        },
      })
    );
    await page.locator("[data-sidebar]").waitFor();
    await page.getByLabel("Loading dashboard").waitFor();
    assert.equal(await page.locator("[data-ready]").count(), 0);
    await page.evaluate(() => {
      window.__subLoading = false;
      window.__rerender();
    });
    await page.locator("[data-metrics-skeleton]").waitFor();
    await page.waitForFunction(() => window.__summaries.length === 1);
    await page.evaluate(() => window.__summaries[0]([]));
    await page.locator("[data-ready]").waitFor();
    await page.getByLabel("Draft filter").fill("saved");
    await page.evaluate(() => {
      window.__store.dispatch(
        window.__actions.getRetailerDetails({ forceRefresh: true })
      );
    });
    await page.waitForFunction(() => window.__retailer.length === 2);
    assert.equal(await page.locator("[data-ready]").count(), 1);
    assert.equal(await page.getByLabel("Draft filter").inputValue(), "saved");
    assert.equal(
      await page.locator('[aria-label="Loading workspace"]').count(),
      0
    );
    await page.evaluate(() =>
      window.__retailer[1]({
        success: false,
        statusCode: 429,
        message: "Rate limited",
      })
    );
    await page.waitForTimeout(50);
    assert.equal(await page.locator("[data-ready]").count(), 1);
    await page.evaluate(() => {
      window.__store.dispatch(window.__actions.getAuthProfile());
    });
    await page.waitForFunction(() => window.__auth.length === 2);
    assert.equal(await page.locator("[data-ready]").count(), 1);
    await page.evaluate(() =>
      window.__auth[1]({
        success: false,
        statusCode: 503,
        message: "Unavailable",
      })
    );
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.__sidebarMounts), 1);
    assert.equal(await page.evaluate(() => window.__contentMounts), 1);
    assert.equal(await page.evaluate(() => window.__summaries.length), 1);
    assert.deepEqual(await page.evaluate(() => window.__redirects), []);
    assert.deepEqual(errors, []);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await addStyles();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      );
    }
    console.log(
      "Browser session checks passed: instant guest form, one initial skeleton, no empty-data flash, preserved dashboard/input state during background refresh, no repeated data fetch or error redirects."
    );
  } finally {
    if (browser) await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
