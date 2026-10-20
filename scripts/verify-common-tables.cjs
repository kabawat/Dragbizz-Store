const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const { createRequire } = require("node:module");
const web = path.resolve(__dirname, "..");
const workspace = path.resolve(web, "..");
const { build } = createRequire(
  path.join(workspace, "dragbizz-desktop/package.json")
)("esbuild");
const {
  chromium,
} = require("/home/kheraj-suthar/.cache/ms-playwright-go/1.50.1/package");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "shared-tables-"));
const aliases = Object.fromEntries(
  [
    "react",
    "react-dom",
    "lucide-react",
    "clsx",
    "tailwind-merge",
    "dompurify",
  ].map((name) => [
    name,
    [
      path.join(web, "node_modules", name),
      path.join(workspace, "dragorbit/node_modules", name),
    ].find((p) => fs.existsSync(p)),
  ])
);
for (const name of ["ui", "core"]) {
  const packageRoot = path.join(workspace, "dragorbit", name);
  for (const [subpath, entry] of Object.entries(
    JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"))
      .exports
  )) {
    if (subpath.includes("*")) continue;
    const target = typeof entry === "string" ? entry : entry.default;
    if (target)
      aliases[
        "@dragorbit/" + name + (subpath === "." ? "" : subpath.slice(1))
      ] = path.join(packageRoot, target);
  }
}

const fixture = `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DataTable} from '${workspace}/dragorbit/ui/src/table/DataTable';
import WebExpenses from '${web}/src/components/expenses/ExpenseTable';
import DesktopExpenses from '${workspace}/dragbizz-desktop/desktop/src/features/expenses/components/ExpenseTable';
const expenses=[{id:'expense-1',title:'Office rent',date:'2026-10-01',category:'rent',amount:2500,paymentMethod:'cash',status:'PAID',vendor:'Owner'}];
function App(){const [variant,setVariant]=useState('default'),[views,setViews]=useState(0),[sort,setSort]=useState(0),[selected,setSelected]=useState(false),[show,setShow]=useState(true);return <main>
<button onClick={()=>setVariant('default')}>Default</button><button onClick={()=>setVariant('minimal')}>Minimal</button><button onClick={()=>setVariant('striped')}>Striped</button><button onClick={()=>setShow(v=>!v)}>Toggle numbers</button>
<output id="events">{views}:{sort}:{String(selected)}</output>
<section data-case="data"><DataTable variant={variant} caption="Data API" rows={[{id:'a',name:'Alice'},{id:'b',name:'Bob'}]} columns={[{id:'name',header:'Name',cell:r=>r.name}]} getRowKey={r=>r.id} showNumOfData={show}/></section>
<section data-case="jsx"><DataTable variant={variant} caption="JSX API" maxHeight={200}><thead><tr><th onClick={()=>setSort(s=>s+1)}>Sort name</th><th>Choice</th><th>Note</th></tr></thead><tbody><tr key="a" onContextMenu={e=>{e.preventDefault();setViews(v=>v+1)}}><td>Alice</td><td><input type="checkbox" aria-label="Select Alice" checked={selected} onChange={e=>setSelected(e.target.checked)}/></td><td><input aria-label="Note" defaultValue="Editable"/></td></tr></tbody><tfoot><tr><td colSpan={3}>Total</td></tr></tfoot></DataTable></section>
<section data-case="web"><WebExpenses expenses={expenses} onView={()=>setViews(v=>v+1)} onEdit={()=>setViews(v=>v+10)}/></section>
<section data-case="desktop"><DesktopExpenses expenses={expenses} onView={()=>setViews(v=>v+1)} onEdit={()=>setViews(v=>v+10)}/></section>
<section data-case="loading"><DataTable caption="Loading" rows={[]} columns={[{id:'x',header:'Name',cell:()=>null}]} getRowKey={r=>r.id} loading/></section>
<section data-case="empty"><DataTable caption="Empty" rows={[]} columns={[{id:'x',header:'Name',cell:()=>null}]} getRowKey={r=>r.id}/></section>
</main>};createRoot(document.getElementById('root')).render(<App/>);
`;
(async () => {
  let server, browser;
  try {
    await build({
      stdin: { contents: fixture, loader: "jsx", resolveDir: web },
      bundle: true,
      jsx: "automatic",
      loader: { ".js": "jsx" },
      outfile: path.join(temp, "app.js"),
      alias: aliases,
      plugins: [
        {
          name: "hosts",
          setup(builder) {
            builder.onResolve(
              { filter: /useTranslation|^react-i18next$/ },
              () => ({ path: "translations", namespace: "mock" })
            );
            builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
              contents: `export function useTranslation(){return {t:(key)=>key}}`,
              loader: "js",
            }));
            builder.onResolve({ filter: /^@\// }, (args) => {
              let base = args.importer.includes("/dragbizz-desktop/")
                ? path.join(workspace, "dragbizz-desktop/desktop/src")
                : path.join(web, "src");
              const target = path.join(base, args.path.slice(2));
              for (const suffix of [
                "",
                ".jsx",
                ".js",
                ".tsx",
                ".ts",
                "/index.js",
                "/index.jsx",
              ])
                if (
                  fs.existsSync(target + suffix) &&
                  fs.statSync(target + suffix).isFile()
                )
                  return { path: target + suffix };
              return null;
            });
          },
        },
      ],
    });
    const assetDir = path.join(
      workspace,
      "dragbizz-desktop/desktop/dist/assets"
    );
    const themeCss = fs
      .readdirSync(assetDir)
      .filter((f) => f.endsWith(".css"))
      .map((f) => fs.readFileSync(path.join(assetDir, f), "utf8"))
      .join("\n");
    fs.writeFileSync(
      path.join(temp, "theme.css"),
      themeCss +
        "\n*{box-sizing:border-box}body{margin:0;padding:16px}main,section{min-width:0}main>section{margin-top:20px}"
    );
    fs.writeFileSync(
      path.join(temp, "index.html"),
      '<html><head><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>'
    );
    server = http.createServer((req, res) => {
      const file = path.join(
        temp,
        req.url === "/" ? "index.html" : req.url.slice(1)
      );
      res.setHeader(
        "Content-Type",
        file.endsWith(".js")
          ? "text/javascript"
          : file.endsWith(".css")
            ? "text/css"
            : "text/html"
      );
      try {
        res.end(fs.readFileSync(file));
      } catch {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    browser = await chromium.launch({
      executablePath: "/opt/google/chrome/chrome",
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:" + server.address().port);
    await page
      .locator('[data-case="desktop"] tbody tr')
      .waitFor()
      .catch((error) => {
        assert.deepEqual(errors, []);
        throw error;
      });
    for (const host of ["web", "desktop"]) {
      const area = page.locator('[data-case="' + host + '"]');
      assert.equal(await area.locator("table").count(), 1);
      assert.equal(
        await area
          .getByRole("columnheader", { name: "SR NO", exact: true })
          .count(),
        1
      );
      assert.equal(await area.locator("tbody tr").count(), 1);
      await area.getByText("Office rent", { exact: true }).click();
    }
    await page.getByLabel("Select Alice", { exact: true }).check();
    await page.getByLabel("Note", { exact: true }).fill("Changed");
    await page.getByRole("columnheader", { name: "Sort name" }).click();
    assert.equal(await page.locator("#events").innerText(), "2:1:true");
    await page
      .locator('[data-case="data"]')
      .getByLabel("Pin Name column", { exact: true })
      .click();
    for (const host of ["web", "desktop"]) {
      const trigger = page
        .locator('[data-case="' + host + '"] tbody button')
        .last();
      await trigger.scrollIntoViewIfNeeded();
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          )
      );
      await trigger.click();
      const edit = page.getByRole("button", {
        name: "common.edit",
        exact: true,
      });
      await edit.waitFor();
      assert.ok(
        await edit.evaluate((el) => el.closest("table") === null),
        "Row menu was clipped inside the table"
      );
      await edit.click();
    }
    assert.equal(await page.locator("#events").innerText(), "22:1:true");
    for (const variant of ["Minimal", "Striped", "Default"]) {
      await page.getByRole("button", { name: variant, exact: true }).click();
      assert.equal(
        await page
          .locator('[data-case="data"] [data-table-variant]')
          .getAttribute("data-table-variant"),
        variant.toLowerCase()
      );
      assert.equal(
        await page
          .locator('[data-case="data"] td[data-pinned-column="left"]')
          .count(),
        2
      );
      assert.equal(
        await page.getByLabel("Note", { exact: true }).inputValue(),
        "Changed"
      );
    }
    await page.getByRole("button", { name: "Toggle numbers" }).click();
    assert.equal(
      await page
        .locator('[data-case="data"]')
        .getByText("SR NO", { exact: true })
        .count(),
      0
    );
    assert.equal(
      await page.locator('[data-case="jsx"] tfoot td').getAttribute("colspan"),
      "4"
    );
    assert.ok(
      await page.locator('[data-case="loading"] [aria-busy="true"]').count()
    );
    assert.ok(
      await page
        .locator('[data-case="empty"]')
        .getByText("No records found.", { exact: true })
        .count()
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1100 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1
        )
      );
      await page.screenshot({
        path: "/tmp/shared-tables-" + width + ".png",
        fullPage: true,
      });
    }
    assert.deepEqual(errors, []);
    console.log(
      "PASS: shared variants, pinned-column state across designs, numbering/opt-out, merged footer, sorting, checkboxes, editable inputs, web/desktop expense callbacks, one table per feature, loading/empty UI and mobile overflow."
    );
  } finally {
    await browser?.close();
    if (server) await new Promise((r) => server.close(r));
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
