const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const {renderToStaticMarkup: render} = require('react-dom/server');
const babel = require('next/dist/compiled/babel/core');
function load(relative, stubs = {}) {
 const filename=path.resolve(__dirname,'..',relative);
 const code=babel.transformSync(fs.readFileSync(filename,'utf8'), {filename,configFile:false,babelrc:false,presets:[[require('next/babel'),{'preset-env':{targets:{node:'current'},modules:'commonjs'}}]]}).code;
 const module={exports:{}};
 new Function('require','module','exports',code)(name=>name in stubs?stubs[name]:name.startsWith('@/')?{}:require(name),module,module.exports);
 return module.exports;
}
const shared='../dragorbit/';
const {TableSkeleton}=load(shared+'ui/src/components/feedback/TableSkeleton.tsx');
const {PageLoader}=load(shared+'ui/src/components/feedback/PageLoader.tsx',{'./TableSkeleton':{TableSkeleton}});
const EmptyState=load(shared+'ui/src/components/feedback/EmptyState.jsx',{'../button/Button':{Button:({children,onClick})=>React.createElement('button',{onClick},children)}}).default;
const ui={PageLoader,EmptyState,TableSkeleton};
const specs=[
 ['products/productSlice.js','getProducts','products','products','ProductsScreen','Product'],
 ['supplier/supplierSlice.js','getSuppliers','suppliers','suppliers','SuppliersScreen','Supplier'],
 ['inventory/inventorySlice.js','getInventories','inventories','inventory','InventoryScreen','Inventory'],
 ['expenses/expenseSlice.js','getExpenses','expenses','expenses','ExpensesScreen','Expense'],
 ['billsSlice.js','getBills','bills','bills','BillsScreen','Bill'],
 ['paymentsSlice.js','getPayments','payments','payments','PaymentsScreen','Payment'],
 ['invoicesSlice.js','getInvoices','invoices','invoices','InvoicesScreen','Invoice'],
 ['purchaseOrdersSlice.js','getPurchaseOrders','list','purchase-orders','PurchaseOrdersScreen','PurchaseOrder'],
 ['salesOrdersSlice.js','getSalesOrders','list','sales-orders','SalesOrdersScreen','SalesOrder'],
];
for(const [file,thunkName,key,feature,screenName,prefix]of specs){
 const {default:reducer,[thunkName]:fetch}=load('src/store/slices/'+file);
 const {[screenName]:Screen}=load(shared+`features/src/${feature}/screen/${screenName}.jsx`,{'@dragorbit/ui':ui});
 const draw=state=>{
  const rows=state[key];
  const model={t:k=>k,products:[],suppliers:[],inventories:[],expenses:[],bills:[],payments:[],invoices:[],purchaseOrders:[],orders:[],[feature==='purchase-orders'?'purchaseOrders':feature==='sales-orders'?'orders':key]:rows,isLoading:state.isLoading||(!state.hasLoaded&&!state.error),inventoryLoading:state.isLoading||(!state.hasLoaded&&!state.error),error:state.error,permissionsLoading:false,header:null,content:'RECORDS',onCreate(){},[prefix+'ListHeader']:()=>null,[prefix+'ListContent']:()=>'RECORDS'};
  return render(React.createElement(Screen,{...model,model}));
 };
 const args={store:'store-a',isFreshLoad:true};
 let state=reducer(undefined,{type:'init'});
 assert.equal(state.hasLoaded,false,file);
 assert.match(draw(state),/aria-busy="true"/,file+' unresolved first render');
 assert.doesNotMatch(draw(state),/animate-spin|noProducts|noSuppliers|noInventory|noBills|noPayments|noResults|noExpenses/,file);
 state=reducer(state,fetch.pending('initial',args));
 assert.match(draw(state),/aria-busy="true"/);
 state=reducer(state,fetch.fulfilled({data:[],pagination:{}},'initial',args));
 assert.equal(state.hasLoaded,true);
 assert.doesNotMatch(draw(state),/aria-busy="true"|animate-spin/);
 assert.match(draw(state),/<h2/,'shared empty state '+file);
 state=reducer(state,fetch.fulfilled({data:[{id:'one',name:'Record'}],pagination:{}},'loaded',args));
 assert.match(draw(state),/RECORDS/);
 state=reducer(state,fetch.pending('refresh',args));
 assert.match(draw(state),/RECORDS/,'cached rows survive refresh '+file);
 assert.doesNotMatch(draw(state),/animate-spin/);
 let failed=reducer(undefined,{type:'init'});
 failed=reducer(failed,fetch.rejected(new Error('offline'),'failed',args,'offline'));
 assert.equal(failed.hasLoaded,true);
 assert.match(draw(failed),/common.error/,'failed response is not empty '+file);
}
const skeleton=render(React.createElement(PageLoader));
assert.doesNotMatch(skeleton,/animate-spin/);
assert.match(skeleton,/animate-pulse/);
const empty=render(React.createElement(EmptyState,{title:'No records',fullHeight:true}));
assert.match(empty,/items-center justify-center text-center/);
assert.match(empty,/100dvh-16rem/);
assert.doesNotMatch(empty,/<p(?:\s|>)/,'omit missing descriptions');
console.log('PASS: 9 list reducers/screens: initial pending, loading, empty, error, populated, cached refresh; shared skeleton and centered empty states.');

// Catalog lists must keep pending, failed and confirmed-empty responses distinct.
const tableUI={...ui,EntityLogo:()=>null,TableRowActions:()=>null,
 DataTable:({loading,rows,loadingContent,errorContent,emptyContent})=>
  React.createElement('div',null,rows.length?'ROWS':loading?loadingContent:errorContent??emptyContent)};
for(const [feature,name,key] of [['categories','Categories','categories'],['brands','Brands','brands'],['variants','Variants','variants']]){
 const {[name+'Table']:Table}=load(shared+`features/src/${feature}/component/${name}Table.jsx`,{'@dragorbit/ui':tableUI});
 const draw=model=>render(React.createElement(Table,{model:{t:k=>k,[key]:[],can:()=>false,canCreate:false,...model}}));
 const pending=draw({loading:true});
 assert.match(pending,/aria-busy="true"/);
 assert.doesNotMatch(pending,/noCategories|noBrands|noVariants|animate-spin/);
 const empty=draw({loading:false});
 assert.match(empty,/<h2/);
 assert.doesNotMatch(empty,/aria-busy="true"/);
 const failed=draw({loading:false,error:'offline'});
 assert.match(failed,/offline/);
 assert.doesNotMatch(failed,/noCategories|noBrands|noVariants/);
 const refresh=draw({loading:true,[key]:[{id:'one'}]});
 assert.match(refresh,/ROWS/);
}
console.log('PASS: category, brand and variant pending/empty/error/refresh UI.');
