from pathlib import Path
import re
p = Path('src/services/productService.js')
t = p.read_text(encoding='utf-8')
m = re.search(r'export const products = \[([\s\S]*)\];', t)
if not m:
    raise SystemExit('no products')
arr = t[m.start(1):m.end(1)]
entries = []
cur = ''
brace = 0
in_str = False
quote = None
esc = False
for ch in arr:
    cur += ch
    if esc:
        esc = False
        continue
    if ch == '\\':
        esc = True
        continue
    if not in_str and ch in "'\"":
        in_str = True
        quote = ch
        continue
    if in_str and ch == quote:
        in_str = False
        quote = None
        continue
    if not in_str:
        if ch == '{':
            brace += 1
        elif ch == '}':
            brace -= 1
            if brace == 0:
                entries.append(cur.strip())
                cur = ''

ids = []
for entry in entries:
    try:
        obj = eval(entry)
        if isinstance(obj, dict) and 'id' in obj:
            ids.append(obj['id'])
    except Exception:
        pass
from collections import Counter
c = Counter(ids)
dups = [k for k,v in c.items() if v>1]
wrong = [(i, ids[i-1], ids[i]) for i in range(1, len(ids)) if ids[i] < ids[i-1]]
print('total', len(ids))
print('unique', len(set(ids)))
print('duplicates count', len(dups), dups[:50])
print('wrong order count', len(wrong), wrong[:50])
