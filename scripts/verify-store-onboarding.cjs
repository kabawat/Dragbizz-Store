const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const desktop = createRequire(
  path.resolve(root, "../dragbizz-desktop/package.json")
);
const { build } = desktop("esbuild");
const {
  chromium,
} = require("/home/kheraj-suthar/.cache/ms-playwright-go/1.50.1/package");
const { compile } = require("@tailwindcss/node");

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "store-onboarding-"));
  let browser;
  const shared = path.resolve(root, "../dragorbit/ui/src/components");
  const mocks = {
    "next/navigation": "export const useRouter=()=>({push(){}});",
    "next/image": `import React from "react";const logos=${JSON.stringify(
      Object.fromEntries(
        ["black", "white"].map((color) => {
          const src = `/DragBizz-Logos/Dragbizz-${color}.svg`;
          return [
            src,
            "data:image/svg+xml;base64," +
              fs
                .readFileSync(path.join(root, "public", src))
                .toString("base64"),
          ];
        })
      )
    )};export default ({priority,src,...props})=><img src={logos[src]||src} {...props}/>;`,
    "@/store/hooks":
      'const state={profile:{agency:{_id:"agency-id",agencyName:"Drag Stores"},stores:[],isLoading:false,error:null}};export const useAppSelector=fn=>fn(state);',
    "@/app/LocationProvider":
      "export const useLocation=()=>({userLocation:null});",
    "@/contexts/ToastContext":
      "export const useGlobalToast=()=>({showError(){}});",
    "@/hooks/useApiResponse": `import {useState} from "react";export default function useApiResponse(){const[data,setData]=useState(null);const[loading,setLoading]=useState(false);return {data,loading,clearAll(){setData(null)},async execute(promise){setLoading(true);try{const result=await promise;setData(result.data);return result}finally{setLoading(false)}}};}`,
    "@/service/retailer/store.service":
      "export default {verifyGst:gst=>new Promise(resolve=>window.__gstRequests.push({gst,resolve})),createStore:async payload=>{window.__created.push(payload);return {data:payload}}};",
    "@/service":
      "export const authService={refreshToken:async()=>({data:{}})};",
    "@/utils/responseHandler/success":
      "export const handleSuccess=value=>value;",
    "@/utils/responseHandler/error":
      "export const handleError=error=>({message:error.message});",
    "@dragorbit/core/domain": 'export const getDashboardUrl=()=>"/dashboard";',
    "@/components/auth/StoreCreationSuccess":
      "export default ()=> <div>Store created</div>;",
    "@/components/ui": [
      "Input:input/Input.jsx",
      "Select:select/Select.jsx",
      "Button:common/Button.jsx",
      "AnimatedBackground:common/AnimatedBackground.jsx",
      "AnimatedGridPattern:common/AnimatedGridPattern.jsx",
    ]
      .map((pair) => {
        const [name, file] = pair.split(":");
        return `export {default as ${name}} from ${JSON.stringify(path.join(shared, file))};`;
      })
      .join("\n"),
    "@/components/onboard": [
      "BasicInfoStep:steps/BasicInfoStep.jsx",
      "ErrorDisplay:ErrorDisplay.jsx",
      "LoadingScreen:LoadingScreen.jsx",
      "StoreFormHeader:StoreFormHeader.jsx",
      "StoreFormNavigation:StoreFormNavigation.jsx",
    ]
      .map((pair) => {
        const [name, file] = pair.split(":");
        return `export {default as ${name}} from ${JSON.stringify(path.join(root, "src/components/onboard", file))};`;
      })
      .join("\n"),
    "@/data": `export {STORE_CATEGORIES} from ${JSON.stringify(path.join(root, "src/data/constants/storeCategories.js"))};`,
  };
  try {
    await build({
      stdin: {
        resolveDir: root,
        loader: "jsx",
        contents:
          'import React from "react";import{createRoot}from"react-dom/client";import Page from "./src/page/onboarding/store/index.jsx";window.__gstRequests=[];window.__created=[];window.mount=()=>createRoot(document.getElementById("root")).render(<Page/>);window.mount();',
      },
      bundle: true,
      jsx: "automatic",
      platform: "browser",
      alias: {
        "@": path.join(root, "src"),
        react: path.dirname(require.resolve("react/package.json")),
        "react-dom": path.dirname(require.resolve("react-dom/package.json")),
      },
      define: { "process.env.NODE_ENV": '"production"' },
      outfile: path.join(dir, "app.js"),
      plugins: [
        {
          name: "isolate-api",
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
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(
      '<html><head></head><body><div id="root"></div></body></html>'
    );
    await page.addStyleTag({
      content:
        ":root{--color-primary:100 65 255;--color-bg-primary:255 255 255;--color-bg-secondary:248 249 252;--color-border-primary:220 222 230;--color-text-primary:24 24 32;--color-text-secondary:100 110 130;--color-text-tertiary:145 150 160;--color-danger:220 38 38;}",
    });
    await page.addStyleTag({
      content: fs.readFileSync(path.join(dir, "app.css"), "utf8"),
    });
    await page.addScriptTag({
      content: fs.readFileSync(path.join(dir, "app.js"), "utf8"),
    });
    await page.waitForSelector("#store-name");
    const compiler = await compile('@import "tailwindcss";', {
      base: root,
      onDependency() {},
    });
    const styles = async () => {
      const tokens = await page.evaluate(() => [
        ...new Set(
          [...document.querySelectorAll("[class]")].flatMap((el) => [
            ...el.classList,
          ])
        ),
      ]);
      await page.addStyleTag({ content: compiler.build(tokens) });
    };
    await styles();
    assert.equal(await page.getByText("Next", { exact: true }).count(), 0);
    assert.equal(await page.locator("#store-phone").count(), 0);
    assert.equal(
      await page.locator("#store-pan").getAttribute("placeholder"),
      "PAN Number (optional)"
    );
    assert.equal(await page.locator('label[for="store-pan"]').count(), 0);
    await page.locator("#store-gst").fill("invalid");
    await page.locator("#store-pan").focus();
    await page
      .getByText("Please enter a valid 15-character GST number", {
        exact: true,
      })
      .waitFor();
    assert.equal(await page.locator("#store-pan").inputValue(), "");
    await page.locator("#store-gst").fill("07AAKCS5515R");
    assert.equal(
      await page.locator("#store-pan").inputValue(),
      "",
      "PAN waits until the entire GST is filled"
    );
    await page.locator("#store-gst").pressSequentially("1zn", { delay: 20 });
    assert.equal(
      await page.locator("#store-gst").inputValue(),
      "07AAKCS5515R1ZN"
    );
    assert.equal(await page.locator("#store-pan").inputValue(), "AAKCS5515R");
    await page.locator("#store-pan").fill("invalid");
    await page.locator("#store-name").focus();
    await page
      .getByText("Please enter a valid 10-character PAN number", {
        exact: true,
      })
      .waitFor();
    await page.locator("#store-pan").fill("abcde1234f");
    await page.waitForFunction(() => window.__gstRequests.length === 1);
    await page.evaluate(() =>
      window.__gstRequests[0].resolve({
        data: {
          _id: "gst-id",
          gstNumber: "07AAKCS5515R1ZN",
          panNumber: "AAKCS5515R",
          legalName: "GST Store",
        },
      })
    );
    await page.waitForTimeout(100);
    assert.equal(
      await page.locator("#store-pan").inputValue(),
      "ABCDE1234F",
      "Verification must preserve manual PAN"
    );
    await page.locator("#store-gst").fill("27AAAAA1234A");
    assert.equal(
      await page.locator("#store-pan").inputValue(),
      "ABCDE1234F",
      "Changing GST preserves manually entered PAN"
    );
    await page
      .getByRole("button", { name: "Add contact", exact: true })
      .click();
    await page.locator("#store-email").fill("bad-email");
    await page.locator("#store-phone").fill("+91 98765 43210");
    await page.getByText("Select store category", { exact: true }).click();
    await styles();
    const option = page.locator('[role="option"]').first();
    if (await option.count()) await option.click();
    else await page.getByText("Grocery & Supermarket", { exact: true }).click();
    await page
      .getByRole("button", { name: "Create Store", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => window.__created.length),
      0,
      "Invalid optional contact blocks submit"
    );
    await page.locator("#store-email").fill("");
    await page.locator("#store-phone").fill("");
    await page
      .getByRole("button", { name: "Hide contact", exact: true })
      .click();
    await page.locator("#store-gst").fill("");
    assert.equal(
      await page.locator("#store-pan").inputValue(),
      "ABCDE1234F",
      "Clearing GST preserves manual PAN"
    );
    await page.locator("#store-name").fill("My Store");
    await styles();
    for (const width of [280, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        `Layout fits ${width}px`
      );
    }
    await page.screenshot({
      path: "/tmp/store-onboarding-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: "/tmp/store-onboarding-mobile.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Create Store", exact: true })
      .click();
    await page.getByText("Store created", { exact: true }).waitFor();
    const payload = await page.evaluate(() => window.__created[0]);
    assert.equal(payload.name, "My Store");
    assert.ok(payload.category);
    assert.ok(!("phone" in payload));
    assert.ok(!("email" in payload));
    assert.equal(payload.pan, "ABCDE1234F");
    assert.deepEqual(errors, []);
    console.log(
      "Single-step store UI passed: GST/PAN derivation and manual override, optional contacts, category, responsive widths and contact-free submit."
    );
  } finally {
    if (browser) await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
