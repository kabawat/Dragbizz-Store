const { createRequire } = require("node:module");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const root = path.resolve(__dirname, "../..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "table-numbering-"));
const output = path.join(temp, "verify.cjs");
const { buildSync } = createRequire(
  path.join(root, "dragbizz-desktop/package.json")
)("esbuild");
const source = `
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {DataTable} from '${root}/dragorbit/ui/src/table/DataTable';
import {NumberedTable} from '${root}/dragorbit/ui/src/table/NumberedTable';
const rows=[{id:'a',name:'Alice'},{id:'b',name:'Bob'}];
const props={rows,columns:[{id:'name',header:'Name',cell:r=>r.name}],getRowKey:r=>r.id,caption:'People'};
const numbered=render(<DataTable {...props}/>);
assert.equal((numbered.match(/SR NO/g)||[]).length,1);
assert.match(numbered,/>1<\\/span>/);assert.match(numbered,/>2<\\/span>/);
assert.doesNotMatch(render(<DataTable {...props} showNumOfData={false}/>),/SR NO/);
assert.match(render(<DataTable {...props} rowNumberOffset={20}/>),/>21<\\/span>/);
assert.match(render(<DataTable {...props} rows={[]} emptyContent='Empty'/>),/colSpan="2"/i);
const pinned=render(<DataTable {...props} rowPinning={{top:['b']}}/>);
assert.ok(pinned.indexOf('>2</span>')<pinned.indexOf('>1</span>'));
const custom=(extra={})=><DataTable {...props} {...extra} renderRow={(row,index,meta)=><tr>{meta.rowNumber!=null&&<td>{meta.rowNumber}</td>}<td>{row.name}</td></tr>}/>;
assert.match(render(custom({rowNumberOffset:20})),/>21<\\/td>/);
assert.doesNotMatch(render(custom({showNumOfData:false})),/SR NO/);
const legacy=(extra={})=><NumberedTable {...extra}><thead><tr><th>Name</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.name}</td></tr>)}</tbody><tfoot><tr><td colSpan={2}>Total</td></tr></tfoot></NumberedTable>;
assert.match(render(legacy()),/>2<\\/span>/);
assert.match(render(legacy()),/colSpan="3"/i);
assert.doesNotMatch(render(legacy({showNumOfData:false})),/SR NO/);
assert.match(render(legacy({rowNumberOffset:20})),/>21<\\/span>/);
assert.doesNotMatch(render(legacy({loading:true})),/>1<\\/span>/);
console.log('PASS: default numbering, opt-out, page offsets, empty colspan, pinned row identity, legacy tables, and skeleton rows.');
`;
const aliases = Object.fromEntries(
  ["react", "react-dom", "lucide-react", "clsx", "tailwind-merge"].map(
    (name) => [name, path.resolve(__dirname, "../node_modules", name)]
  )
);
buildSync({
  alias: aliases,
  stdin: {
    contents: source,
    loader: "tsx",
    resolveDir: path.join(root, "dragorbit"),
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: output,
  jsx: "automatic",
  loader: { ".css": "empty" },
});
try {
  require(output);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
