import { expect, test } from '@playwright/test';

test.describe('public experience', () => {
  test('loads the home page and navigates to appointment booking', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/DentaCare \| Home/);
    await expect(page.getByRole('heading', { name: /Dental care that is easy to understand/i })).toBeVisible();
    await expect(page.getByText('Sample data is used throughout this portfolio application.')).toBeVisible();
    await expect(page.getByText('SmileCraft Dental')).toHaveCount(0);

    const contactCards = page.locator('.contact-strip article');
    await expect(contactCards.first()).toHaveCSS('display', 'grid');
    await expect(contactCards.nth(0).getByText('Address:', { exact: true })).toBeVisible();
    await expect(contactCards.nth(1).getByText('Phone:', { exact: true })).toBeVisible();
    await expect(contactCards.nth(2).getByText('Hours:', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Book an appointment' }).first().click();
    await expect(page).toHaveURL(/\/appointment$/);
    await expect(page.getByRole('heading', { name: 'Book your dental appointment.' })).toBeVisible();
    await expect(page.getByText(/Please use fictional personal and medical information/i)).toBeVisible();
  });

  test('keeps public pages within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const path of ['/', '/about', '/services', '/contact']) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });

  test('shows validation feedback for an incomplete appointment', async ({ page }) => {
    await page.route('**/api/master-data**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ services: [], timeSlots: [], branches: [], appointmentStatuses: [] })
      });
    });
    await page.route('**/api/dentists**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/appointment');
    await page.getByRole('button', { name: 'Confirm appointment' }).click();

    await expect(page.getByText('This field is required.').first()).toBeVisible();
  });
});
