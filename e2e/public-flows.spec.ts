import { expect, test } from '@playwright/test';

test.describe('public experience', () => {
  test('loads the home page and navigates to appointment booking', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/DentaCare \| Home/);
    await expect(page.getByRole('heading', { name: /Trusted dental care/i })).toBeVisible();

    await page.getByRole('link', { name: 'Book Appointment' }).first().click();
    await expect(page).toHaveURL(/\/appointment$/);
    await expect(page.getByRole('heading', { name: 'Book an appointment' })).toBeVisible();
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
