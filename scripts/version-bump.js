#!/usr/bin/env node

/**
 * Simple version bumping script for DM Hero
 * Usage: node scripts/version-bump.js [version]
 *
 * Examples:
 *   node scripts/version-bump.js 1.0.0-beta.1
 *   node scripts/version-bump.js 1.0.0
 */

const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const rootDir = join(__dirname, '..')

const newVersion = process.argv[2]

if (!newVersion) {
  console.error('Usage: node scripts/version-bump.js <version>')
  console.error('Example: node scripts/version-bump.js 1.0.0-beta.1')
  process.exit(1)
}

// Validate version format
if (!/^\d+\.\d+\.\d+(-[a-zA-Z]+\.\d+)?$/.test(newVersion)) {
  console.error('Invalid version format. Use: X.Y.Z or X.Y.Z-tag.N')
  console.error('Examples: 1.0.0, 1.0.0-beta.1, 1.0.0-alpha.5')
  process.exit(1)
}

const packageFiles = [
  'package.json',
  'packages/app/package.json',
  'packages/landing/package.json',
]

for (const file of packageFiles) {
  const filePath = join(rootDir, file)
  try {
    const content = JSON.parse(readFileSync(filePath, 'utf-8'))
    const oldVersion = content.version
    content.version = newVersion
    writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n')
    console.log(`✓ ${file}: ${oldVersion} → ${newVersion}`)
  } catch (err) {
    console.error(`✗ Failed to update ${file}: ${err.message}`)
  }
}

console.log(`\nVersion bumped to ${newVersion}`)
console.log('\nNext steps:')
console.log('  1. git add -A && git commit -m "chore: release v' + newVersion + '"')
console.log('  2. git tag v' + newVersion)
console.log('  3. git push && git push --tags')
