const fs = require('fs');
const path = require('path');
const file = fs.readFileSync(path.join(process.cwd(),'src','services','productService.js'),'utf8');
const m = file.match(/export const products = \[([\s\S]*)\];/);
if (!m) {
  console.error('no products');
  process.exit(1);
}
const content = m[1];
const ids = [];
const regex = /\{([\s\S]*?)\}/g;
let match;
while ((match = regex.exec(content))) {
  const entry = '{' + match[1] + '}';
  try {
    const obj = eval('(' + entry + ')');
    if (obj && obj.id !== undefined) ids.push(obj.id);
  } catch (e) {
    // ignore
  }
}
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
const unique = [...new Set(ids)];
const wrongOrder = ids.map((id, i) => ({index:i,id,prev:i>0?ids[i-1]:null})).filter(o => o.index > 0 && o.id < o.prev);
console.log('total', ids.length);
console.log('unique', unique.length);
console.log('duplicates count', duplicates.length);
console.log('duplicates unique', [...new Set(duplicates)].sort((a,b)=>a-b));
console.log('wrong order count', wrongOrder.length);
console.log('wrong order sample', wrongOrder.slice(0,40));
fs.writeFileSync(path.join(process.cwd(),'tmp-product-ids.json'), JSON.stringify({ids, duplicates, wrongOrder}, null, 2));
