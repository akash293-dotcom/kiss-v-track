// ============================================================
// KISS V-TRACK — Capacitor Native Integration
// ============================================================
// Handles Android-specific features: back button, status bar,
// splash screen, keyboard, and app lifecycle

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Initialize native platform features.
 * Safe to call on web — Capacitor APIs are no-ops on web.
 */
export async function initializeNativePlatform(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return; // Skip on web browser
  }

  // ── Status Bar ──
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#4f46e5' }); // Indigo-600
  } catch {
    // Status bar plugin may not be available
  }

  // ── Splash Screen ──
  try {
    // Hide splash screen after app loads (auto-hide after 2s in config)
    await SplashScreen.hide();
  } catch {
    // Splash screen plugin may not be available
  }

  // ── Keyboard ──
  try {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch {
    // Keyboard plugin may not be available
  }

  // ── Hardware Back Button (Android) ──
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // On root screen, minimize the app instead of exiting
      App.minimizeApp();
    }
  });

  // ── App State (foreground/background) ──
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      // App came to foreground — could refresh data
      console.log('[KISS V-TRACK] App resumed');
    } else {
      console.log('[KISS V-TRACK] App backgrounded');
    }
  });
}

/**
 * Check if running as a native Android/iOS app
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform
 */
export function getPlatform(): string {
  return Capacitor.getPlatform(); // 'web' | 'android' | 'ios'
}
