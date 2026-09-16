import { expect, test } from '@playwright/test';

const patientUser = {
  _id: 'patient-1',
  name: 'Demo Playwright Patient',
  email: 'patient@test.invalid',
  phone: '0710000000',
  idNumber: '0000000000000',
  role: 'PATIENT',
  isActive: true
};

test.describe('authentication', () => {
  test('logs a demo patient in and opens the patient portal', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'playwright-token', user: patientUser })
      });
    });

    await page.route('**/api/appointments/mine', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        return;
      }
      await route.continue();
    });

    await page.goto('/login');
    await page.locator('input[formcontrolname="email"]').fill('patient@test.invalid');
    await page.locator('input[formcontrolname="password"]').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/patient\/appointments$/);
    await expect(page.getByRole('heading', { name: 'My demo appointments' })).toBeVisible();
    await expect(page.getByText('No demo appointments found yet.')).toBeVisible();
  });

  test('shows the API error returned for invalid credentials', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password' })
      });
    });

    await page.goto('/login');
    await page.locator('input[formcontrolname="email"]').fill('patient@test.invalid');
    await page.locator('input[formcontrolname="password"]').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});
