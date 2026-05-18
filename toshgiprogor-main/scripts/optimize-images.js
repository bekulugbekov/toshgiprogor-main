/**
 * Rasmlarni WebP va AVIF formatga konvertatsiya qilish + o'lchamini kamaytirish.
 * Ishlatish: npm run images
 *
 * Natija: har bir rasm uchun assets/img/**\/*.webp va *.avif yaratialdi.
 * HTML da <picture> tegi bilan ishlatish (E1 hujjatiga qarang).
 */

import sharp from 'sharp'
import { glob } from 'node:fs/promises'
import { resolve, dirname, basename, extname } from 'node:path'
import { existsSync } from 'node:fs'

const INPUT_DIR = resolve('assets/img')
const FORMATS = [
  { format: 'webp', options: { quality: 82 } },
  { format: 'avif', options: { quality: 60, effort: 4 } },
]
const SOURCE_EXTS = ['.jpg', '.jpeg', '.png']

async function getImages() {
  const results = []
  for await (const file of glob(`${INPUT_DIR}/**/*.{jpg,jpeg,png}`, { withFileTypes: false })) {
    results.push(file)
  }
  return results
}

async function convert(inputPath) {
  const dir = dirname(inputPath)
  const name = basename(inputPath, extname(inputPath))

  for (const { format, options } of FORMATS) {
    const outputPath = resolve(dir, `${name}.${format}`)
    if (existsSync(outputPath)) continue
    try {
      await sharp(inputPath)[format](options).toFile(outputPath)
      console.log(`  ✓ ${outputPath.replace(INPUT_DIR, '')}`)
    } catch (err) {
      console.warn(`  ✗ ${inputPath}: ${err.message}`)
    }
  }
}

const images = await getImages()
console.log(`${images.length} ta rasm topildi. Konvertatsiya boshlanmoqda...\n`)
await Promise.all(images.map(convert))
console.log('\nTayyior. HTML da <picture> tegi bilan ishlating:')
console.log(`
<picture>
  <source srcset="assets/img/rasm.avif" type="image/avif">
  <source srcset="assets/img/rasm.webp" type="image/webp">
  <img src="assets/img/rasm.jpg" alt="..." loading="lazy" width="800" height="600">
</picture>
`)
