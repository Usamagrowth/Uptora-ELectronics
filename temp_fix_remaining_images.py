from pathlib import Path
path = Path('src/services/productService.js')
text = path.read_text(encoding='utf-8')
replacements = {
    '/products/15promax newde.jpg': '/products/15promax new.jpg',
    '/products/16 new.jpg': '/products/iphone 16 new.jpg',
    '/products/sako-battery.jpg': '/products/sako-battery1.jpg',
    '/products/ANKERSOUNDCOREAUDIOSEMI-IN-EARK20I1.jpg': '/products/ANKERSOUNDCOREAUDIOSEMI-IN-EARK20I2.jpg',
    '/products/JBLTUNE520HEADSETBLUE1.jpg': '/products/JBL_Headphones.jpg',
    '/products/HAVITAUDIOHEADPHONEH630BT1.jpg': '/products/2ndcatheadphonez.png',
}
for old, new in replacements.items():
    text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('updated', len(replacements), 'replacements')
