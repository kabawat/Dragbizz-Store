const path = require("node:path");
const { generateFirebaseServiceWorker } = require("../../dragorbit/core/scripts/firebase-sw-builder.cjs");

generateFirebaseServiceWorker(path.resolve(__dirname, ".."));
