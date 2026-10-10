import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const jsonPath = path.join(rootDir, 'src/data/viet_phuc_remix_normalized_catalog_v2.json');
const garmentsDir = path.join(rootDir, 'public/assets/garments');

const validExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

if (!fs.existsSync(garmentsDir)) {
  fs.mkdirSync(garmentsDir, { recursive: true });
}

const allFiles = fs.readdirSync(garmentsDir);
const imageFiles = allFiles.filter((file) => {
  const ext = path.extname(file).toLowerCase();
  return validExtensions.has(ext);
});

const imageMap = new Map();
for (const file of imageFiles) {
  const baseName = path.parse(file).name;
  imageMap.set(baseName, file);
}

const rawData = fs.readFileSync(jsonPath, 'utf8');
const catalog = JSON.parse(rawData);

const validItemIds = new Set((catalog.items || []).map((item) => item.id));

const unmatchedFiles = [];
for (const file of imageFiles) {
  const baseName = path.parse(file).name;
  if (!validItemIds.has(baseName)) {
    unmatchedFiles.push(file);
  }
}

let matchedCount = 0;
for (const item of catalog.items || []) {
  if (imageMap.has(item.id)) {
    const matchedFile = imageMap.get(item.id);
    item.image_path = `/assets/garments/${matchedFile}`;
    item.imageUrl = `/assets/garments/${matchedFile}`;
    matchedCount++;
  } else {
    item.image_path = null;
    item.imageUrl = null;
  }
}

if (Array.isArray(catalog.imageImportTemplate)) {
  for (const templateEntry of catalog.imageImportTemplate) {
    if (imageMap.has(templateEntry.item_id)) {
      const matchedFile = imageMap.get(templateEntry.item_id);
      templateEntry.image_path = `/assets/garments/${matchedFile}`;
    } else {
      templateEntry.image_path = null;
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

console.log(`Gắn ảnh cho ${matchedCount}/77 item`);
if (unmatchedFiles.length > 0) {
  console.log('Danh sách file không khớp id nào:');
  unmatchedFiles.forEach((file) => console.log(`- ${file}`));
} else {
  console.log('Danh sách file không khớp id nào: (không có)');
}
