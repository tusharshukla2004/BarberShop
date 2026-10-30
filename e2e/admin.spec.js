import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & Booking Management E2E', () => {
  test('logs into admin portal, navigates to bookings and updates booking status', async ({ page }) => {
    // 1. Visit Admin Login Page
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/Admin Sign In/i);
    await expect(page.locator('h1:has-text("SOVEREIGN PORTAL")')).toBeVisible();

    // 2. Fill credentials
    await page.fill('#admin-email', 'owner@barbershop.com');
    await page.fill('#admin-password', 'Secret123!');
    await page.click('button:has-text("Sign In to Console")');

    // 3. Redirected to Admin Dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1:has-text("EXECUTIVE OVERVIEW")')).toBeVisible({ timeout: 10000 });

    // 4. Navigate to Bookings Management
    await page.click('a[href="/admin/bookings"]');
    await expect(page).toHaveURL(/\/admin\/bookings/);
    await expect(page.locator('h1:has-text("BOOKINGS ROSTER")')).toBeVisible();

    // 5. Select a status dropdown in the table and update it
    const statusSelect = page.locator('select[aria-label^="Update status"]').first();
    await statusSelect.waitFor({ state: 'visible', timeout: 8000 });

    // Change status to "completed"
    await statusSelect.selectOption('completed');

    // Verify toast or updated value
    await expect(statusSelect).toHaveValue('completed');
  });
});
