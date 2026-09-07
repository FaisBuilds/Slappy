import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const soundsDir = path.join(__dirname, '..', 'public', 'sounds')
const manifestPath = path.join(soundsDir, 'manifest.json')

if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true })
}

const files = fs.readdirSync(soundsDir)

const sounds = files
  .filter((file) => file.toLowerCase().endsWith('.mp3'))
  .filter((file) => file.toLowerCase() !== 'manifest.json')
  .map((file) => `sounds/${file}`)
  .sort()

const manifest = {
  generatedAt: new Date().toISOString(),
  sounds,
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

console.log(`Sound manifest: ${sounds.length} file(s) → ${manifestPath}`)
