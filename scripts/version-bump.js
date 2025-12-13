#!/usr/bin/env node

/**
 * Version bumping script for DM Hero
 *
 * Usage:
 *   node scripts/version-bump.js <version>           # Bump app only (default)
 *   node scripts/version-bump.js <version> --landing # Bump landing only
 *   node scripts/version-bump.js <version> --all     # Bump all packages
 *
 * Examples:
 *   node scripts/version-bump.js 1.0.0-beta.3
 *   node scripts/version-bump.js 1.0.0 --landing
 */

const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const rootDir = join(__dirname, '..')

const args = process.argv.slice(2)
const newVersion = args.find((arg) => !arg.startsWith('--'))
const bumpLanding = args.includes('--landing')
const bumpAll = args.includes('--all')

if (!newVersion) {
  console.error('Usage: node scripts/version-bump.js <version> [--landing|--all]')
  console.error('')
  console.error('Options:')
  console.error('  (default)   Bump app only')
  console.error('  --landing   Bump landing only')
  console.error('  --all       Bump all packages')
  console.error('')
  console.error('Examples:')
  console.error('  node scripts/version-bump.js 1.0.0-beta.3')
  console.error('  node scripts/version-bump.js 1.0.0 --landing')
  process.exit(1)
}

// Validate version format
if (!/^\d+\.\d+\.\d+(-[a-zA-Z]+\.\d+)?$/.test(newVersion)) {
  console.error('Invalid version format. Use: X.Y.Z or X.Y.Z-tag.N')
  console.error('Examples: 1.0.0, 1.0.0-beta.1, 1.0.0-alpha.5')
  process.exit(1)
}

// Determine which packages to bump
let packageFiles
if (bumpAll) {
  packageFiles = ['package.json', 'packages/app/package.json', 'packages/landing/package.json']
  console.log('Bumping ALL packages...\n')
} else if (bumpLanding) {
  packageFiles = ['packages/landing/package.json']
  console.log('Bumping LANDING only...\n')
} else {
  packageFiles = ['package.json', 'packages/app/package.json']
  console.log('Bumping APP only...\n')
}

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
console.log('  2. git push')
