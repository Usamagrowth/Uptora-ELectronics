import fs from 'fs';
import path from 'path';
const file = fs.readFileSync(path.join(process.cwd(),'src/services/productService.js'), 'utf8');
const start = file.indexOf('export const products = [');
if (start === -1) throw new Error('no products');
const arrText = file.slice(start + 'export const products = ['.length, file.lastIndexOf('];'));
const entries = [];
let current = '';
let brace = 0;
let inString = false;
let quote = null;
let escape = false;
for (const ch of arrText) {
  current += ch;
  if (escape) { escape = false; continue; }
  if (ch === '\\') { escape = true; continue; }
  if (!inString && (ch === '"' || ch === "'")) { inString = true; quote = ch; continue; }
  if (inString && ch === quote) { inString = false; quote = null; continue; }
  if (!inString) {
    if (ch === '{') brace += 1;
    if (ch === '}') brace -= 1;
    if (brace === 0 && current.trim()) {
      entries.push(current.trim());
      current = '';
    }
  }
}
const ids = [];
for (const entry of entries) {
  try {
    const obj = eval('(' + entry + ')');
    if (obj && obj.id !== undefined) ids.push(obj.id);
  } catch (e) {
    // ignore
  }
}
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const unique = [...new Set(ids)];
const wrongOrder = ids.map((id, index) => ({ index, id, prev: index > 0 ? ids[index - 1] : null })).filter((item) => item.index > 0 && item.id < item.prev);
console.log('total', ids.length);
console.log('unique', unique.length);
console.log('duplicates count', duplicates.length);
console.log('duplicates sample', [...new Set(duplicates)].slice(0, 100));
console.log('wrong order count', wrongOrder.length);
console.log('wrong order sample', wrongOrder.slice(0, 50));
fs.writeFileSync(path.join(process.cwd(),'tmp-product-check.json'), JSON.stringify({ ids, duplicates, wrongOrder }, null, 2));
