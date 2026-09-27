# KISS V-TRACK — Android APK Build Guide

## Overview

KISS V-TRACK uses **Capacitor 6** to wrap the React web application as a native Android APK. This provides a genuine native app experience with splash screen, status bar integration, and offline capabilities.

## Prerequisites

1. **Node.js** >= 20.0.0
2. **Android Studio** (latest stable) — [Download](https://developer.android.com/studio)
3. **Java JDK 17** — Required by Android Gradle
4. **Android SDK** — API Level 34 (installed via Android Studio)

### Environment Variables

Set these in your system environment (Windows):

```powershell
# Add to system PATH
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

Or in `~/.bashrc` (Linux/Mac):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

---

## Step-by-Step: Build APK

### 1. Install Dependencies

```bash
cd kiss-v-track
npm install

cd apps/web
npm install
```

### 2. Build the Web App

```bash
npm run build
```

This generates the production build in `apps/web/dist/`.

### 3. Initialize Android Project (First Time Only)

```bash
npx cap add android
```

This creates the `apps/web/android/` directory with a full Android project.

### 4. Sync Web Assets to Android

```bash
npx cap sync android
```

This copies the `dist/` build output into the Android project's assets.

### 5. Option A: Build Debug APK (Command Line)

```bash
cd android
./gradlew assembleDebug
```

The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Option B: Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The release APK will be at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 5. Option C: Open in Android Studio

```bash
npx cap open android
```

Then use **Build → Build Bundle(s) / APK(s) → Build APK(s)** in Android Studio.

---

## Quick Commands

All-in-one commands from the `apps/web/` directory:

```bash
# Build web + sync + open Android Studio
npm run android:build

# Build web + sync + run on connected device/emulator
npm run android:run

# Build debug APK
npm run android:apk

# Build release APK
npm run android:apk:release
```

---

## Signing the Release APK

For distribution (Play Store or direct install), you need to sign the APK.

### 1. Generate a Keystore

```bash
keytool -genkey -v -keystore kiss-vtrack-release.keystore \
  -alias kiss-vtrack -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing in `android/app/build.gradle`

Add inside the `android {}` block:

```groovy
signingConfigs {
    release {
        storeFile file('kiss-vtrack-release.keystore')
        storePassword System.getenv('KEYSTORE_PASSWORD') ?: 'your-store-password'
        keyAlias 'kiss-vtrack'
        keyPassword System.getenv('KEY_PASSWORD') ?: 'your-key-password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Build Signed Release APK

```bash
cd android
./gradlew assembleRelease
```

> ⚠️ **Never commit the keystore or passwords to version control!**

---

## Configuring the API URL for Android

When running on an Android device, `localhost` won't work. Update the API URL:

### For Emulator

The Android emulator maps `10.0.2.2` to the host machine's localhost:

```
VITE_API_URL=http://10.0.2.2:3000/api/v1
```

### For Physical Device

Use your computer's local network IP:

```
VITE_API_URL=http://192.168.1.100:3000/api/v1
```

### For Production

Point to your deployed API:

```
VITE_API_URL=https://api.kiss-vtrack.in/api/v1
```

Set this in `apps/web/.env` before building.

---

## App Customization

### App Icon

Replace the icon files in:
```
android/app/src/main/res/mipmap-*/
```

Or use Android Studio's **Image Asset Studio** (right-click `res` → New → Image Asset).

### Splash Screen

The splash screen is configured in `capacitor.config.ts`. To customize:

1. Place splash images in `android/app/src/main/res/drawable/`
2. Update `capacitor.config.ts` splash screen settings

### App Name & Package ID

- App Name: Set in `capacitor.config.ts` → `appName`
- Package ID: Set in `capacitor.config.ts` → `appId` (currently `in.ac.kiss.vtrack`)

---

## Testing on Device

### USB Debugging

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect via USB
4. Run: `npx cap run android`

### Wireless Debugging (Android 11+)

1. Enable **Wireless Debugging** in Developer Options
2. Pair using: `adb pair <ip>:<port>`
3. Connect: `adb connect <ip>:<port>`
4. Run: `npx cap run android`

---

## Troubleshooting

### "ANDROID_HOME not set"
Set the environment variable pointing to your Android SDK location.

### Build fails with JDK error
Ensure JDK 17 is installed and `JAVA_HOME` is set correctly.

### White screen on app launch
- Check that `npm run build` completed successfully
- Run `npx cap sync android` again
- Check the API URL is accessible from the device

### API calls fail on Android
- Use `10.0.2.2` instead of `localhost` for emulator
- Use your computer's IP for physical device
- Ensure CORS allows the Android origin
