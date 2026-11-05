import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const emojisDir = path.join(rootDir, 'public', 'emojis')
const manifestPath = path.join(emojisDir, 'manifest.json')

if (!fs.existsSync(emojisDir)) {
  fs.mkdirSync(emojisDir, { recursive: true })
}

const emojis = fs.readdirSync(emojisDir)
  .filter((file) => file.toLowerCase().endsWith('.png'))
  .sort((a, b) => a.localeCompare(b))
  .map((file) => `emojis/${file}`)

const manifest = {
  generatedAt: new Date().toISOString(),
  emojis,
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Emoji manifest: ${emojis.length} file(s) → ${manifestPath}`)
