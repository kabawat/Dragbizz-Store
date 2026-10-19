const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {createRequire} = require('node:module');
const root = path.resolve(__dirname, '..');
const shared = path.resolve(root, '../dragorbit/ui/src');
const {build} = createRequire(path.resolve(root, '../dragbizz-desktop/package.json'))('esbuild');
const {chromium} = require('/home/kheraj-suthar/.cache/ms-playwright-go/1.50.1/package');
const {compile} = require('@tailwindcss/node');
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'empty-state-ui-'));let browser;
 try {
 await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import EmptyState from ${JSON.stringify(shared+'/components/feedback/EmptyState.jsx')};import{PageLoader}from ${JSON.stringify(shared+'/components/feedback/PageLoader.tsx')};import{DataTable}from ${JSON.stringify(shared+'/table/DataTable.tsx')};const root=createRoot(document.getElementById('root'));window.draw=mode=>root.render(mode==='empty'?<main id="content" style={{display:'flex',minHeight:'calc(100dvh - 16rem)'}}><EmptyState fullHeight title="No customers yet" description="Your customers will appear here." actionButton={{label:'Add customer',onClick(){}}}/></main>:mode==='loading'?<PageLoader/>:<DataTable caption="Customers" rows={[{id:'one',name:'Alice'}]} columns={[{id:'name',header:'Name',cell:r=>r.name}]} getRowKey={r=>r.id} loading={mode==='refresh'}/>);window.draw('empty');`,loader:'jsx',resolveDir:root},alias:{react:path.join(root,"node_modules/react"),"react-dom":path.join(root,"node_modules/react-dom")},bundle:true,format:'iife',platform:'browser',jsx:'automatic',outfile:path.join(temp,'app.js'),loader:{'.css':'empty'}});
 browser=await chromium.launch({executablePath:'/opt/google/chrome/chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<html><body style="margin:0;padding:20px"><div id="root"></div></body></html>');
 await page.addStyleTag({content:':root{--color-primary:100 65 255;--color-bg-primary:255 255 255;--color-bg-secondary:248 249 252;--color-bg-tertiary:235 237 242;--color-border-primary:220 222 230;--color-text-primary:24 24 32;--color-text-secondary:100 110 130;}'});
 await page.addScriptTag({content:fs.readFileSync(path.join(temp,'app.js'),'utf8')});
 const compiler=await compile('@import "tailwindcss";',{base:root,onDependency(){}});
 const css=async()=>{const tokens=await page.evaluate(()=>[...new Set([...document.querySelectorAll('[class]')].flatMap(el=>[...el.classList]))]);await page.addStyleTag({content:compiler.build(tokens)});};
 for(const [width,height]of [[1440,900],[390,844]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.draw('empty'));await page.getByRole('heading',{name:'No customers yet'}).waitFor();await css();
  const layout=await page.evaluate(()=>{const section=document.querySelector('main section'),outer=section.getBoundingClientRect(),items=[...section.children].map(el=>el.getBoundingClientRect());return{section:outer.toJSON(),top:items[0].top,bottom:items.at(-1).bottom,center:items.map(r=>(r.left+r.right)/2),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(layout.overflow,false,'no horizontal overflow '+width);
  assert.ok(Math.abs((layout.top+layout.bottom)/2-(layout.section.top+layout.section.bottom)/2)<18,'vertically centered '+width);
  layout.center.forEach(x=>assert.ok(Math.abs(x-(layout.section.left+layout.section.right)/2)<2,'horizontally centered '+width));
 }
 await page.evaluate(()=>window.draw('loading'));await page.locator('[aria-busy="true"]').waitFor();await css();assert.equal(await page.locator('[class*="animate-spin"]').count(),0);
 await page.evaluate(()=>window.draw('refresh'));await page.getByText('Alice',{exact:true}).waitFor();assert.equal(await page.locator('[class*="animate-spin"]').count(),0);assert.equal(await page.getByRole('columnheader',{name:'SR NO'}).count(),1);
 assert.deepEqual(errors,[]);
 console.log('PASS: real shared UI centered on desktop/mobile, no overflow, skeleton-only data loading, cached rows visible during refresh, no browser errors.');
 }finally{await browser?.close();fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
