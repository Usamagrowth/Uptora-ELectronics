from pathlib import Path
import re

path = Path(r"c:\Users\usama\Desktop\uptora-electronics\src\services\productService.js")
text = path.read_text(encoding='utf-8')
start = text.index('export const products = [')
end = text.index('export function getCategories()')
body = text[start:end]
count = 0
pattern = re.compile(r'(\b(?:id|"id")\s*:\s*)(\d+)')

def repl(match):
    global count
    count += 1
    return f"{match.group(1)}{count}"

new_body = pattern.sub(repl, body)
path.write_text(text[:start] + new_body + text[end:], encoding='utf-8')
print('Renumbered product IDs sequentially')
