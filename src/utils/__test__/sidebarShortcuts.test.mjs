import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildSidebarShortcutHandlers } from "../sidebarShortcuts.js";

const invoice = {
  href: "/dashboard/invoices",
  shortcut: "i",
  module: "invoice",
};
const cashbook = {
  href: "/dashboard/cashbook",
  shortcut: "shift+c",
  module: "cashbook",
};

test("Invoice and Cashbook shortcuts call the exact sidebar navigation callback", () => {
  const calls = [];
  const handlers = buildSidebarShortcutHandlers(
    [{ subMenuItems: [invoice] }, { subMenuItems: [cashbook] }],
    (item) => calls.push(item)
  );
  let prevented = 0;
  handlers["alt+i"]({ preventDefault: () => prevented++ });
  handlers["alt+shift+c"]({ preventDefault: () => prevented++ });
  assert.equal(calls[0], invoice);
  assert.equal(calls[1], cashbook);
  assert.equal(prevented, 2);
});
test("filtered-out routes are unavailable and access metadata is preserved", () => {
  const pos = {
    href: "/dashboard/pos",
    shortcut: "k",
    module: "invoice",
    requireCapability: "pos",
    requireAnalytics: false,
  };
  let navigated;
  const handlers = buildSidebarShortcutHandlers(
    [{ subMenuItems: [pos] }],
    (item) => {
      navigated = item;
    }
  );
  assert.equal(handlers["alt+i"], undefined);
  handlers["alt+k"]({ preventDefault() {} });
  assert.equal(navigated, pos);
});
test("shortcut registration is inside the sidebar rather than the root outside SubscriptionProvider", () => {
  const root = readFileSync(
    new URL("../../app/layout.jsx", import.meta.url),
    "utf8"
  );
  const sidebar = readFileSync(
    new URL("../../components/dashboard/sidebar/index.jsx", import.meta.url),
    "utf8"
  );
  const routes = readFileSync(
    new URL("../../app/(routes)/layout.jsx", import.meta.url),
    "utf8"
  );
  assert.equal(root.includes("<GlobalHotkeys"), false);
  assert.ok(sidebar.includes("<GlobalHotkeys"));
  assert.ok(sidebar.includes("onNavigate={onNavigate}"));
  assert.ok(routes.includes("<SubscriptionProvider>"));
});
