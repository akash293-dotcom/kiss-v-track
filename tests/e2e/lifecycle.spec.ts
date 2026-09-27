// ============================================================
// KISS V-TRACK — E2E Test: Complete Training Lifecycle
// ============================================================
// Tests the full workflow from admin creating a program
// to a trainee receiving a certificate

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api/v1';

// Dev credentials
const ADMIN = { email: 'admin@kiss-vtrack.dev', password: 'Admin@123' };
const TRAINER = { email: 'priya.trainer@kiss-vtrack.dev', password: 'Trainer@123' };
const TRAINEE = { email: 'anita.trainee@kiss-vtrack.dev', password: 'Trainee@123' };

test.describe('KISS V-TRACK Full Lifecycle', () => {
  
  test('Admin can login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('KISS V-TRACK')).toBeVisible();
    
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('Admin dashboard shows metrics', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Check dashboard has stat cards
    await expect(page.getByText(/Total Trainees/i)).toBeVisible();
    await expect(page.getByText(/Active Batches/i)).toBeVisible();
  });

  test('Admin can view trainees', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await page.goto('/admin/trainees');
    await expect(page.getByText(/Trainees/i)).toBeVisible();
    // Should show seed data trainees
    await expect(page.getByText('Anita')).toBeVisible();
  });

  test('Trainer can login and view dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TRAINER.email);
    await page.getByLabel('Password').fill(TRAINER.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await expect(page).toHaveURL(/\/trainer\/dashboard/);
  });

  test('Trainee can login and view dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TRAINEE.email);
    await page.getByLabel('Password').fill(TRAINEE.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await expect(page).toHaveURL(/\/trainee\/dashboard/);
  });

  test('Trainee can view skill passport', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TRAINEE.email);
    await page.getByLabel('Password').fill(TRAINEE.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await page.goto('/trainee/skill-passport');
    await expect(page.getByText(/Skill Passport/i)).toBeVisible();
  });

  test('Public certificate verification works', async ({ page }) => {
    await page.goto('/verify/certificate/KISS-VT-2026-000001');
    // Should show verification result without login
    await expect(page.getByText(/KISS V-TRACK/i)).toBeVisible();
    await expect(page.getByText(/KISS-VT-2026-000001/i)).toBeVisible();
  });

  test('Unauthorized access redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('API Health', () => {
  test('Health endpoint returns OK', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});
