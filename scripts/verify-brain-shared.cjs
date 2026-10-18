const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");
const { pathToFileURL } = require("node:url");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

async function main() {
  const fe = path.resolve(__dirname, "../..");
  const feature = path.join(fe, "dragorbit/features/src/brain");
  for (const filename of fs.readdirSync(feature)) {
    if (!/\.(jsx?|tsx?)$/.test(filename)) continue;
    const source = fs.readFileSync(path.join(feature, filename), "utf8");
    assert.ok(
      !/from\s+["'](?:next\/|@\/|electron)/.test(source),
      `${filename} imports a platform dependency`
    );
  }
  const { build } = await import(
    pathToFileURL(
      path.join(fe, "dragbizz-desktop/node_modules/vite/dist/node/index.js")
    )
  );
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "brain-compatibility-"));
  try {
    for (const [name, entry] of [
      ["shared", path.join(feature, "index.js")],
      [
        "desktop",
        path.join(
          fe,
          "dragbizz-desktop/desktop/src/features/brain/BrainPanel.jsx"
        ),
      ],
    ]) {
      await build({
        configFile: false,
        css: { postcss: { plugins: [] } },
        logLevel: "error",
        esbuild: { jsx: "automatic" },
        resolve: { dedupe: ["react", "react-dom"] },
        build: {
          lib: { entry, formats: ["cjs"], fileName: () => "brain.cjs" },
          outDir: path.join(temp, name),
          rollupOptions: {
            external: [
              "react",
              "react-dom",
              "react/jsx-runtime",
              "@tanstack/react-router",
            ],
          },
        },
      });
    }
    const filename = path.join(temp, "shared/brain.cjs");
    const compiled = new Module(filename, module);
    compiled.paths = module.paths;
    compiled._compile(fs.readFileSync(filename, "utf8"), filename);
    const brain = compiled.exports;
    const noop = () => {};
    const chat = {
      messages: [],
      isSending: false,
      isConfirming: false,
      storeId: "store",
      sessionId: "session",
      sendChat: noop,
      confirmPending: noop,
      rejectPending: noop,
      resetChat: noop,
      loadChat: noop,
    };
    const grouped = { today: [], yesterday: [], week: [], older: [] };
    const history = {
      grouped,
      refresh: noop,
      getSession: noop,
      optimisticTouch: noop,
    };
    const voice = {
      isSupported: false,
      isListening: false,
      transcript: "",
      interimTranscript: "",
      startListening: noop,
      stopListening: noop,
      abortListening: noop,
      resetTranscript: noop,
    };
    const html = renderToStaticMarkup(
      React.createElement(brain.BrainPanel, {
        t: (key) => key,
        chat,
        history,
        voice,
      })
    );
    assert.ok(html.includes('aria-haspopup="dialog"'));
    const workspace = renderToStaticMarkup(
      React.createElement(
        brain.ChatWorkspace,
        {
          t: (key) => key,
          historyGrouped: grouped,
          onNewChat: noop,
          onSelectSession: noop,
          onQuickPrompt: noop,
          hasThread: true,
        },
        "Shared message"
      )
    );
    assert.ok(workspace.includes("Shared message"));
    const messages = renderToStaticMarkup(
      React.createElement(brain.ChatAssistantMessage, {
        message: "[POS](/dashboard/pos)",
      })
    );
    assert.ok(messages.includes('href="/dashboard/pos"'));
    const viewport = { width: 1200, height: 900 };
    const bounds = { left: 100, top: 100, width: 500, height: 500 };
    for (const direction of ["n", "e", "s", "w", "ne", "nw", "se", "sw"]) {
      for (const delta of [-2000, -30, 30, 2000]) {
        const next = brain.resizePanel(
          bounds,
          direction,
          delta,
          delta,
          viewport
        );
        assert.ok(
          next.left >= 12 &&
            next.top >= 12 &&
            next.width >= 360 &&
            next.height >= 420
        );
        assert.ok(
          next.left + next.width <= 1188 && next.top + next.height <= 888
        );
        if (direction.includes("w")) assert.equal(next.left + next.width, 600);
        if (direction.includes("n")) assert.equal(next.top + next.height, 600);
      }
    }
    console.log(
      "Brain checks passed: shared/desktop bundles, platform boundaries, renderer-safe UI, links, workspace and 32 resize cases."
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
