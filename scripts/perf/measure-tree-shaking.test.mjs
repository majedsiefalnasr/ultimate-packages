import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyBundle,
  componentNameFor,
  isComponentSubpath,
  pickComponentExport,
} from "./measure-tree-shaking.mjs";

const meta = (inputs) => ({
  outputs: { "out.js": { bytes: 1234, inputs } },
});

test("classifyBundle: clean bundle has no foreign components", () => {
  const r = classifyBundle(
    meta({
      "packages/react/dist/button/index.mjs": { bytesInOutput: 800 },
      "packages/react-core/dist/index.mjs": { bytesInOutput: 434 },
    }),
    "button",
    ["dialog", "checkbox"]
  );
  assert.deepEqual(r, { bytes: 1234, foreignComponents: [] });
});

test("classifyBundle: planted foreign module is listed, once", () => {
  const r = classifyBundle(
    meta({
      "packages/react/dist/button/index.mjs": { bytesInOutput: 800 },
      "packages/react/dist/dialog/index.mjs": { bytesInOutput: 30 },
      "packages/react/dist/dialog/chunk-x.mjs": { bytesInOutput: 10 },
    }),
    "button",
    ["dialog", "checkbox"]
  );
  assert.equal(r.bytes, 1234);
  assert.deepEqual(r.foreignComponents, ["dialog"]);
});

test("classifyBundle: component src directory also counts as foreign", () => {
  const r = classifyBundle(
    meta({ "packages/ng/checkbox/src/checkbox.ts": { bytesInOutput: 5 } }),
    "button",
    ["checkbox"]
  );
  assert.deepEqual(r.foreignComponents, ["checkbox"]);
});

test("classifyBundle: a prefix-sharing sibling is not confused (select vs select-button)", () => {
  const r = classifyBundle(
    meta({ "packages/react/dist/select-button/index.mjs": { bytesInOutput: 5 } }),
    "select",
    ["select-button"]
  );
  assert.deepEqual(r.foreignComponents, ["select-button"]);
  const own = classifyBundle(
    meta({ "packages/react/dist/select-button/index.mjs": { bytesInOutput: 5 } }),
    "select-button",
    ["select"]
  );
  assert.deepEqual(own.foreignComponents, []);
});

test("classifyBundle: Angular fesm entry and differently-spelled style dirs are recognized", () => {
  const r = classifyBundle(
    meta({
      "dist/fesm2022/ultimate-ng-dialog.mjs": { bytesInOutput: 5 },
      "../uix-styles/dist/inputnumber/index.mjs": { bytesInOutput: 5 },
    }),
    "button",
    ["dialog", "input-number", "checkbox"]
  );
  assert.deepEqual(r.foreignComponents, ["dialog", "input-number"]);
});

test("classifyBundle: a module that contributes zero bytes is not present code", () => {
  const r = classifyBundle(
    meta({ "packages/react/dist/dialog/index.mjs": { bytesInOutput: 0 } }),
    "button",
    ["dialog"]
  );
  assert.deepEqual(r.foreignComponents, []);
});

test("pickComponentExport prefers the exact U-name, then the first U-export, then the first export", () => {
  assert.equal(pickComponentExport(["UTab", "UTabs", "createBaseTabs"], "./tabs"), "UTabs");
  assert.equal(pickComponentExport(["UTabMenu", "UTabPanel"], "./tabs"), "UTabMenu");
  assert.equal(pickComponentExport(["useKeyFilter"], "./key-filter"), "useKeyFilter");
});

test("isComponentSubpath excludes root and package.json", () => {
  assert.equal(isComponentSubpath("."), false);
  assert.equal(isComponentSubpath("./package.json"), false);
  assert.equal(isComponentSubpath("./button"), true);
});

test("componentNameFor derives the U-prefixed PascalCase name from a subpath", () => {
  assert.equal(componentNameFor("./radio-button"), "URadioButton");
});
