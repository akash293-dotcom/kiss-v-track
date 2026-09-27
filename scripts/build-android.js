#!/usr/bin/env node
// ============================================================
// KISS V-TRACK — Android APK Build Script
// ============================================================
// Usage: node scripts/build-android.js [--release]
//
// This script:
// 1. Builds the React web app
// 2. Initializes Capacitor Android (if needed)
// 3. Syncs web assets to Android project
// 4. Builds the APK using Gradle

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..', 'apps', 'web');
const androidDir = path.join(webDir, 'android');
const isRelease = process.argv.includes('--release');

function run(cmd, cwd = webDir) {
  console.log(`\n▶ ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (e) {
    console.error(`\n✗ Command failed: ${cmd}`);
    process.exit(1);
  }
}

console.log('═══════════════════════════════════════════');
console.log('  🎓 KISS V-TRACK — Android APK Builder');
console.log('═══════════════════════════════════════════');
console.log(`  Mode: ${isRelease ? 'RELEASE' : 'DEBUG'}`);
console.log('');

// Step 1: Build web app
console.log('📦 Step 1: Building web app...');
run('npm run build');

// Step 2: Initialize Android project if needed
if (!fs.existsSync(androidDir)) {
  console.log('\n📱 Step 2: Initializing Android project...');
  run('npx cap add android');
} else {
  console.log('\n📱 Step 2: Android project exists, skipping init');
}

// Step 3: Sync web assets
console.log('\n🔄 Step 3: Syncing web assets to Android...');
run('npx cap sync android');

// Step 4: Build APK
const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const buildTask = isRelease ? 'assembleRelease' : 'assembleDebug';

console.log(`\n🔨 Step 4: Building ${isRelease ? 'release' : 'debug'} APK...`);
run(`${gradleCmd} ${buildTask}`, androidDir);

// Step 5: Report output
const apkDir = isRelease
  ? path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release')
  : path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug');

const apkFile = isRelease ? 'app-release-unsigned.apk' : 'app-debug.apk';
const apkPath = path.join(apkDir, apkFile);

if (fs.existsSync(apkPath)) {
  const stats = fs.statSync(apkPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ APK BUILD SUCCESSFUL!');
  console.log('═══════════════════════════════════════════');
  console.log(`  📁 APK: ${apkPath}`);
  console.log(`  📏 Size: ${sizeMB} MB`);
  console.log('');

  if (isRelease) {
    console.log('  ⚠️  Release APK is unsigned.');
    console.log('  Sign it with: jarsigner or Android Studio');
  } else {
    console.log('  📲 Install on connected device:');
    console.log(`  adb install ${apkPath}`);
  }
  console.log('═══════════════════════════════════════════\n');
} else {
  console.log('\n⚠️  APK file not found at expected location.');
  console.log(`  Expected: ${apkPath}`);
  console.log('  Check the Gradle output above for errors.\n');
}
