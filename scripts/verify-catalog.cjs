const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const babel = require("next/dist/compiled/babel/core");
const root = path.resolve(__dirname, "..");
const shared = path.resolve(root, "../dragorbit");
const cache = new Map();
const overrides = new Map();

function load(file) {
  let filename = file;
  if (!fs.existsSync(filename)) {
    filename = [".js", ".jsx", ".ts", ".tsx"]
      .map((ext) => file + ext)
      .find(fs.existsSync);
  }
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const code = babel.transformSync(fs.readFileSync(filename, "utf8"), {
    filename,
    configFile: false,
    babelrc: false,
    presets: [
      [
        require("next/babel"),
        { "preset-env": { targets: { node: "current" } } },
      ],
    ],
  }).code;
  const localRequire = (id) => {
    if (overrides.has(id)) return overrides.get(id);
    if (id.endsWith(".css")) return {};
    if (id.startsWith("@/")) return load(path.join(root, "src", id.slice(2)));
    if (id.startsWith("."))
      return load(path.resolve(path.dirname(filename), id));
    if (
      id === "react" ||
      id.startsWith("react/") ||
      id.startsWith("react-dom") ||
      id === "lucide-react"
    )
      return require(id);
    try {
      return createRequire(filename)(id);
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") throw error;
      return require(id);
    }
  };
  new Function("require", "module", "exports", code)(
    localRequire,
    module,
    module.exports
  );
  return module.exports;
}

async function main() {
  const utils = load(path.join(root, "src/utils/catalog.util.js"));
  const store = "123456789012345678901234";
  const other = "123456789012345678901235";
  const form = {
    ...utils.catalogFormValues(),
    name: " Summer ",
    subdomain: " Summer-Shop ",
    stores: [store],
    defaultStore: store,
  };
  const { fields, payload } = utils.buildCatalogPayload(form, [store]);
  assert.deepEqual(fields, {});
  assert.deepEqual(payload, {
    name: "Summer",
    subdomain: "summer-shop",
    stores: [store],
    defaultStore: store,
    status: "ACTIVE",
  });
  assert.deepEqual(utils.updateCatalogStores(form, []).defaultStore, "");
  assert.equal(
    utils.updateCatalogStores(form, [store, other]).defaultStore,
    store
  );
  assert.ok(
    utils.buildCatalogPayload({ ...form, defaultStore: other }, [store]).fields
      .defaultStore
  );
  assert.ok(utils.buildCatalogPayload(form, []).fields.stores);
  for (const subdomain of [
    "",
    "api",
    "dragbizz",
    "store",
    "-shop",
    "shop-",
    "a.b",
    "a b",
    "a".repeat(64),
  ])
    assert.ok(utils.validateCatalogSubdomain(subdomain), subdomain);
  for (const subdomain of ["a", "my-store", "Shop123", "a".repeat(63)])
    assert.equal(utils.validateCatalogSubdomain(subdomain), null);
  assert.ok(
    utils.buildCatalogPayload({ ...form, name: " " }, [store]).fields.name
  );
  assert.ok(
    utils.buildCatalogPayload({ ...form, status: "DELETED" }, [store]).fields
      .status
  );
  const existing = {
    ...payload,
    id: "catalog-id",
    catalogId: "public-id",
    agency: "agency",
    branding: { theme: { color: "#123456" } },
    settings: { enabled: false },
  };
  const edit = utils.buildCatalogPayload(utils.catalogFormValues(existing), [
    store,
  ]);
  assert.equal(edit.payload.branding, undefined);
  assert.equal(edit.payload.settings, undefined);
  assert.equal(edit.payload.catalogId, undefined);
  assert.equal(edit.payload.agency, undefined);

  const backend = path.resolve(root, "../../be/DragBizz-Core/src");
  overrides.set(
    "@src/constants/enum/store.enum",
    require(path.join(backend, "constants/enum/store.enum.js"))
  );
  const backendValidation = load(
    path.join(backend, "utils/validations/catalog.validation.js")
  );
  assert.equal(backendValidation.validateCatalog(payload).isValid, true);
  assert.equal(
    backendValidation.validateCatalog(edit.payload, true).isValid,
    true
  );
  assert.deepEqual(
    utils.CATALOG_STATUSES.map((option) => option.value),
    backendValidation.CATALOG_STATUSES
  );
  for (const reserved of backendValidation.RESERVED_SUBDOMAINS)
    assert.ok(utils.validateCatalogSubdomain(reserved), reserved);

  const initial = [
    { id: "one", name: "Old" },
    { id: "two", name: "Second" },
  ];
  const appended = utils.appendCatalogs(initial, [
    { id: "two", name: "Updated" },
    { id: "three", name: "Third" },
  ]);
  assert.deepEqual(
    appended.map((item) => item.id),
    ["one", "two", "three"]
  );
  assert.equal(appended[1].name, "Updated");
  assert.equal(initial[1].name, "Second");

  const calls = [];
  const axios = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      (...args) => {
        calls.push([method, ...args]);
        return Promise.resolve();
      },
    ])
  );
  const {
    HttpService,
    handleSuccess,
    handleError,
  } = require("@dragorbit/core/api");
  class TestBaseService extends HttpService {
    constructor() {
      super({ authAxios: axios });
    }
  }
  overrides.set("@/config", {
    API_CONFIG: { RETAILER: { CATALOG: "/retailer/catalog" } },
  });
  overrides.set("@/service/base/BaseService", { BaseService: TestBaseService });
  const service = load(
    path.join(root, "src/service/retailer/catalog.service.js")
  ).default;
  await service.getCatalogs({
    limit: 10,
    nextCursor: "opaque-cursor",
    search: "summer shop",
    status: "ACTIVE",
    sortBy: "name",
    sortOrder: "asc",
  });
  await service.getCatalog("catalog-id");
  await service.createCatalog(payload);
  await service.updateCatalog("catalog-id", edit.payload);
  await service.deleteCatalog("catalog-id");
  const query = new URL(calls[0][1], "http://localhost").searchParams;
  assert.equal(query.get("nextCursor"), "opaque-cursor");
  assert.equal(query.get("search"), "summer shop");
  assert.equal(query.get("status"), "ACTIVE");
  assert.deepEqual(calls[1], ["get", "/retailer/catalog?id=catalog-id"]);
  assert.deepEqual(calls[2], ["post", "/retailer/catalog", payload]);
  assert.deepEqual(calls[3], [
    "put",
    "/retailer/catalog/catalog-id",
    edit.payload,
  ]);
  assert.deepEqual(calls[4], ["delete", "/retailer/catalog/catalog-id"]);
  const pagination = {
    hasNextPage: true,
    limit: 10,
    nextCursor: "opaque-cursor",
  };
  assert.deepEqual(
    handleSuccess({ data: { status: true, data: [existing], pagination } })
      .pagination,
    pagination
  );
  assert.deepEqual(
    handleError({
      response: {
        status: 409,
        data: {
          message: "Duplicate entry found",
          fields: { subdomain: "Already exists" },
        },
      },
    }).fields,
    { subdomain: "Already exists" }
  );
  assert.equal(
    handleError({
      response: {
        status: 403,
        data: { code: "QUOTA_EXCEEDED", message: "Upgrade your plan" },
      },
    }).code,
    "QUOTA_EXCEEDED"
  );

  const ui = {};
  for (const [name, file, exported = "default"] of [
    ["Button", "button/Button.tsx", "Button"],
    ["Input", "input/Input.jsx"],
    ["Select", "select/Select.jsx"],
    ["MultiSelect", "common/MultiSelect.jsx"],
    ["Alert", "common/Alert.jsx"],
    ["Badge", "common/Badge.jsx"],
    ["EmptyState", "feedback/EmptyState.jsx"],
    ["TableSkeleton", "feedback/TableSkeleton.tsx", "TableSkeleton"],
  ])
    ui[name] = load(path.join(shared, "ui/src/components", file))[exported];
  Object.assign(
    ui,
    load(path.join(shared, "ui/src/components/common/Table.jsx"))
  );
  const contextEvents = [];
  const contextRows = [];
  let contextMenu = null;
  let contextItems = [];
  let closedMenus = 0;
  ui.useRowActionMenu = () => ({
    menu: contextMenu,
    closeMenu: () => {
      closedMenus++;
    },
    openContextMenu: (event, rowId) => {
      assert.equal(event.prevented, true);
      contextEvents.push(rowId);
    },
  });
  ui.RowContextMenuLayer = () => null;
  ui.RowActionsMenu = (props) => {
    contextItems = props.items;
    return null;
  };
  const OriginalTableRow = ui.TableRow;
  ui.TableRow = (props) => {
    if (props.onContextMenu) contextRows.push(props.onContextMenu);
    return React.createElement(OriginalTableRow, props);
  };
  overrides.set("@dragorbit/ui", ui);
  const capturedActions = [];
  const { TableRowActions } = load(
    path.join(shared, "ui/src/table/TableRowActions.tsx")
  );
  overrides.set("@dragorbit/ui/table", {
    TableRowActions: (props) => {
      capturedActions.push(props.actions);
      return React.createElement(TableRowActions, props);
    },
  });
  const { CatalogsScreen } = load(
    path.join(shared, "features/src/catalogs/screen/CatalogsScreen.jsx")
  );
  const actionCalls = [];
  const model = {
    catalogs: [],
    pagination,
    loading: true,
    error: null,
    search: "",
    status: "",
    loadingMore: false,
    onOpen: (catalog, mode) => actionCalls.push([mode, catalog.id]),
    onCopyLink: (catalog) => actionCalls.push(["copy", catalog.id]),
    onDelete: (catalog) => actionCalls.push(["delete", catalog.id]),
    statuses: utils.CATALOG_STATUSES,
    storeNames: new Map([[store, "My Store"]]),
  };
  const render = (changes) =>
    renderToStaticMarkup(
      React.createElement(CatalogsScreen, { model: { ...model, ...changes } })
    );
  assert.match(render({}), /Loading Digital Shops/);
  assert.doesNotMatch(render({}), /No Digital Shops yet/);
  assert.match(render({ loading: false }), /No Digital Shops yet/);
  assert.match(
    render({ loading: false, search: "missing" }),
    /No matching Digital Shops/
  );
  assert.match(
    render({ loading: false, error: "Offline" }),
    /Couldn&#x27;t load Digital Shops/
  );
  const listHtml = render({ loading: false, catalogs: [existing] });
  assert.match(listHtml, /SR No/);
  assert.match(listHtml, /My Store/);
  assert.doesNotMatch(listHtml, /Manage your Agency|<h1|Sort by/);
  assert.match(listHtml, /Search by Digital Shop name/);
  assert.match(listHtml, /aria-label="Search digital shops"/);
  assert.doesNotMatch(listHtml, /<label[^>]*>\s*(?:Search|Status)\s*<\/label>/);
  assert.match(listHtml, /All statuses/);
  assert.match(listHtml, /Refresh/);
  assert.match(listHtml, /aria-keyshortcuts="Alt\+n"/);
  assert.match(listHtml, /aria-keyshortcuts="Alt\+r"/);
  assert.match(listHtml, /Actions for Summer/);
  assert.match(listHtml, /aria-haspopup="menu"/);
  const actions = capturedActions.at(-1);
  assert.deepEqual(
    actions.map((action) => action.id),
    ["view", "edit", "copy", "open", "delete"]
  );
  assert.equal(actions.at(-1).tone, "danger");
  for (const id of ["view", "edit", "copy", "delete"])
    actions.find((action) => action.id === id).onClick();
  assert.deepEqual(actionCalls, [
    ["view", "catalog-id"],
    ["edit", "catalog-id"],
    ["copy", "catalog-id"],
    ["delete", "catalog-id"],
  ]);
  const previousWindow = global.window;
  global.window = {
    location: { protocol: "https:", host: "dragbizz.com" },
    open: (...args) => actionCalls.push(args),
  };
  try {
    actions.find((action) => action.id === "open").onClick();
    assert.deepEqual(actionCalls.at(-1), [
      "https://summer-shop.dragbizz.com/",
      "_blank",
      "noopener,noreferrer",
    ]);
  } finally {
    if (previousWindow === undefined) delete global.window;
    else global.window = previousWindow;
  }
  assert.doesNotMatch(listHtml, /Per page|Previous|Branding &amp; settings/);
  assert.match(
    render({ loading: false, loadingMore: true, catalogs: [existing] }),
    /Loading more digital shops/
  );
  assert.match(
    render({ loading: false, error: "Offline", catalogs: [existing] }),
    /Retry loading more/
  );
  assert.match(
    render({
      loading: false,
      catalogs: [existing],
      pagination: { hasNextPage: false, nextCursor: null },
    }),
    /All 1 digital shops loaded/
  );
  assert.match(listHtml, /md:hidden/);
  assert.match(listHtml, /md:block/);
  const event = {
    preventDefault() {
      this.prevented = true;
    },
  };
  contextRows.at(-1)(event);
  assert.equal(event.prevented, true);
  assert.equal(contextEvents.at(-1), "catalog-id");
  contextMenu = { mode: "context", rowId: "catalog-id", x: 50, y: 75 };
  render({ loading: false, catalogs: [existing] });
  assert.deepEqual(
    contextItems.map((item) => item.key),
    ["view", "edit", "copy", "open", "delete"]
  );
  const beforeClose = closedMenus;
  contextItems.find((item) => item.key === "edit").onClick();
  assert.equal(closedMenus, beforeClose + 1);
  assert.deepEqual(actionCalls.at(-1), ["edit", "catalog-id"]);
  render({ loading: false, catalogs: [existing], busy: true });
  const beforeEvents = contextEvents.length;
  contextRows.at(-1)({ preventDefault() {} });
  assert.equal(contextEvents.length, beforeEvents);
  contextMenu = null;

  ui.SideDrawer = (props) => {
    assert.equal(props.position, "center");
    assert.equal(props.autoHeight, true);
    assert.equal(props.draggable, false);
    assert.equal(props.resizable, false);
    assert.match(props.width, /sm:w-\[560px\]/);
    return React.createElement(
      "section",
      null,
      React.createElement("h2", null, props.title),
      props.children,
      React.createElement("footer", null, props.footer)
    );
  };
  overrides.set("@/components/ui", ui);
  overrides.set("@/hooks/useApiResponse", {
    __esModule: true,
    default: () => ({
      loading: false,
      execute: () => {
        throw new Error("Unexpected request during render");
      },
    }),
  });
  const hotkeyMaps = [];
  overrides.set("@/hooks/keyboard/useHotkeys", {
    useHotkeys: (keyMap) => hotkeyMaps.push(keyMap),
  });
  const Form = load(
    path.join(root, "src/components/catalog/CatalogFormDrawer.jsx")
  ).default;
  const Details = load(
    path.join(root, "src/components/catalog/CatalogDetailsDrawer.jsx")
  ).default;
  const stores = [{ storeId: store, storeName: "My Store" }];
  const formHtml = renderToStaticMarkup(
    React.createElement(Form, { catalog: existing, stores })
  );
  assert.doesNotMatch(formHtml, /Branding|settings|JSON object/);
  assert.match(formHtml, /form="catalog-form"/);
  assert.match(formHtml, /Save changes/);
  assert.equal(typeof hotkeyMaps.at(-1)["ctrl+s"], "function");
  assert.equal(typeof hotkeyMaps.at(-1)["ctrl+enter"], "function");
  assert.match(
    formHtml,
    /aria-keyshortcuts="Control\+s Control\+Enter Meta\+s Meta\+Enter"/
  );
  assert.match(formHtml, /Stores &amp; availability/);
  assert.match(formHtml, /Shop address/);
  assert.match(formHtml, /1 selected/);
  assert.match(formHtml, /sm:grid-cols-2/);
  const detailsHtml = renderToStaticMarkup(
    React.createElement(Details, {
      catalog: {
        ...existing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      stores,
    })
  );
  assert.match(detailsHtml, /Open digital shop/);
  assert.match(detailsHtml, /Copy link/);
  assert.match(detailsHtml, /Shop address/);
  assert.match(detailsHtml, /Default/);
  const emptyDetailsHtml = renderToStaticMarkup(
    React.createElement(Details, {
      catalog: { ...existing, stores: [], defaultStore: null },
      stores,
    })
  );
  assert.match(emptyDetailsHtml, /No Stores linked/);
  assert.match(emptyDetailsHtml, /Link Stores/);
  assert.match(emptyDetailsHtml, /Not selected/);
  assert.doesNotMatch(detailsHtml, /Branding|settings|JSON object/);

  const registry = load(path.join(root, "src/data/config/moduleRegistry.js"));
  assert.equal(
    registry.getModuleFromPath("/dashboard/management/catalogs"),
    "online_store"
  );
  console.log(
    "PASS: Catalog form validation, Store/default membership, hidden advanced fields, cursor page appending, shop link actions, CRUD service contracts, pagination, API errors, route access mapping, and loading/empty/error/desktop/mobile rendering."
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
