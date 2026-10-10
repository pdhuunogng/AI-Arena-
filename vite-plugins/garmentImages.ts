import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

const VIRTUAL_MODULE_ID = 'virtual:garment-images';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

export function garmentImagesPlugin(): Plugin {
  let root = process.cwd();
  let garmentsDir = path.resolve(root, 'public/assets/garments');
  let catalogPath = path.resolve(root, 'src/data/viet_phuc_remix_normalized_catalog_v2.json');
  let isDevMode = false;

  function scanGarmentImages(): Record<string, string> {
    const map: Record<string, string> = {};
    if (!fs.existsSync(garmentsDir)) {
      return map;
    }

    let validIds: Set<string> | null = null;
    if (isDevMode && fs.existsSync(catalogPath)) {
      try {
        const catalogRaw = fs.readFileSync(catalogPath, 'utf-8');
        const catalog = JSON.parse(catalogRaw);
        if (Array.isArray(catalog?.items)) {
          validIds = new Set(catalog.items.map((it: { id: string }) => it.id));
        }
      } catch {
        // Ignore JSON read errors
      }
    }

    const files = fs.readdirSync(garmentsDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        const itemId = path.parse(file).name;
        map[itemId] = `/assets/garments/${file}`;
        if (validIds && !validIds.has(itemId)) {
          console.warn(
            `\x1b[33m[garment-images]\x1b[0m Cảnh báo: Tệp "${file}" trong public/assets/garments/ không khớp với bất kỳ item.id nào trong catalog JSON.`
          );
        }
      }
    }

    return map;
  }

  return {
    name: 'vite-plugin-garment-images',
    configResolved(config) {
      root = config.root || process.cwd();
      garmentsDir = path.resolve(root, 'public/assets/garments');
      catalogPath = path.resolve(root, 'src/data/viet_phuc_remix_normalized_catalog_v2.json');
      isDevMode = config.command === 'serve';
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const map = scanGarmentImages();
        return `export default ${JSON.stringify(map, null, 2)};`;
      }
      return null;
    },
    configureServer(server: ViteDevServer) {
      isDevMode = true;
      if (!fs.existsSync(garmentsDir)) {
        fs.mkdirSync(garmentsDir, { recursive: true });
      }
      server.watcher.add(garmentsDir);

      const handleGarmentFileChange = (filePath: string) => {
        const normalized = path.resolve(filePath);
        if (normalized.startsWith(garmentsDir)) {
          const ext = path.extname(normalized).toLowerCase();
          if (IMAGE_EXTENSIONS.has(ext)) {
            for (const [id, mod] of server.moduleGraph.idToModuleMap.entries()) {
              if (id.includes('virtual:garment-images')) {
                server.moduleGraph.invalidateModule(mod);
              }
            }

            server.ws.send({
              type: 'full-reload',
              path: '*',
            });
          }
        }
      };

      server.watcher.on('add', handleGarmentFileChange);
      server.watcher.on('unlink', handleGarmentFileChange);
      server.watcher.on('change', handleGarmentFileChange);
    },
  };
}
