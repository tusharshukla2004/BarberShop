import { test, expect } from '@playwright/test';

test.describe('Customer Booking Flow E2E', () => {
  test('completes full appointment flow from Hero request form to confirmation', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    await expect(page).toHaveTitle(/The Vintage Blade/i);

    // 2. Fill quick appointment form in Hero
    await page.fill('#hero-name', 'Rohan Sharma');
    await page.fill('#hero-phone', '9876543210');

    // Fill preferred date & time (tomorrow at 11:00 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0] + 'T11:00';
    await page.fill('#hero-datetime', dateStr);

    // Submit request
    await page.click('button:has-text("Submit request")');

    // Verify post-submit callout
    await expect(page.locator('text=Draft saved!')).toBeVisible({ timeout: 5000 });

    // Click "Complete" to navigate to /book
    await page.click('button:has-text("Complete")');
    await expect(page).toHaveURL(/\/book/);

    // 3. Step 1: Select Service
    await expect(page.locator('text=1. Select Treatment')).toBeVisible();
    // Select the first service card button
    const serviceBtn = page.locator('button:has-text("Select Service")').first();
    await serviceBtn.click();

    // 4. Step 2: Select Barber
    await expect(page.locator('text=2. Select Craftsman')).toBeVisible();
    const barberBtn = page.locator('button:has-text("Select Barber")').first();
    await barberBtn.click();

    // 5. Step 3: Pick Date and Available Slot
    await expect(page.locator('text=3. Date & Time')).toBeVisible();
    // Click an available slot pill
    const slotBtn = page.locator('button:has-text("AM"), button:has-text("PM")').first();
    await slotBtn.waitFor({ state: 'visible', timeout: 8000 });
    await slotBtn.click();

    // 6. Step 4: Review Details and Confirm Reservation
    await expect(page.locator('text=4. Your Details')).toBeVisible();
    // Ensure name & phone are prefilled from draft
    await expect(page.locator('#booking-name')).toHaveValue('Rohan Sharma');
    await expect(page.locator('#booking-phone')).toHaveValue('9876543210');

    // Submit appointment confirmation
    const confirmBtn = page.locator('button:has-text("Confirm Reservation")');
    await confirmBtn.click();

    // 7. Verify Confirmation Step
    await expect(page.locator('text=APPOINTMENT RESERVED')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Reference Code')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Calendar (.ics)")')).toBeVisible();
    await expect(page.locator('a:has-text("Share on WhatsApp")')).toBeVisible();
  });
});
