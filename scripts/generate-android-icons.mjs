/**
 * Builds Android mipmap PNGs from a source image (PNG or SVG).
 * Run: npm run icons:android
 *
 * Source file (first match wins):
 *   1) public/android-icon.png  — предпочтительно, квадрат 1024×1024 или больше
 *   2) public/app-icon.png
 *   3) public/favicon.png
 *   4) public/favicon.svg
 */
import { mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')
const androidRes = join(root, 'android/app/src/main/res')

const SOURCE_CANDIDATES = [
  join(publicDir, 'android-icon.png'),
  join(publicDir, 'app-icon.png'),
  join(publicDir, 'favicon.png'),
  join(publicDir, 'favicon.svg')
]

function resolveSourcePath() {
  const found = SOURCE_CANDIDATES.find((p) => existsSync(p))
  return found ?? null
}

/** Подложка под legacy launcher, если в PNG прозрачные края */
const pad = { r: 1, g: 141, b: 251, alpha: 1 }

const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
const adaptiveFg = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 }

/** Сильное DEFLATE-сжатие — без этого 15 PNG в mipmap легко дают +3–6 МБ к APK/AAB */
const pngOut = {
  compressionLevel: 9,
  adaptiveFiltering: true,
  effort: 10
}

async function renderIcon(sourcePath, size, outFile, transparentBg) {
  const bg = transparentBg ? { r: 0, g: 0, b: 0, alpha: 0 } : pad
  await sharp(sourcePath)
    .resize(size, size, { fit: 'contain', background: bg })
    .png(pngOut)
    .toFile(outFile)
}

const sourcePath = resolveSourcePath()
if (!sourcePath) {
  console.error(
    'Нет файла иконки. Положи один из:\n  public/android-icon.png\n  public/app-icon.png\n  public/favicon.png\n  public/favicon.svg'
  )
  process.exit(1)
}

console.log('Source:', sourcePath)

for (const [name, size] of Object.entries(legacy)) {
  const dir = join(androidRes, `mipmap-${name}`)
  mkdirSync(dir, { recursive: true })
  await renderIcon(sourcePath, size, join(dir, 'ic_launcher.png'), false)
  await renderIcon(sourcePath, size, join(dir, 'ic_launcher_round.png'), false)
  console.log(`wrote mipmap-${name} ic_launcher (+ round) ${size}px`)
}

for (const [name, size] of Object.entries(adaptiveFg)) {
  const dir = join(androidRes, `mipmap-${name}`)
  mkdirSync(dir, { recursive: true })
  await renderIcon(sourcePath, size, join(dir, 'ic_launcher_foreground.png'), true)
  console.log(`wrote mipmap-${name} ic_launcher_foreground ${size}px`)
}

console.log('Done.')
