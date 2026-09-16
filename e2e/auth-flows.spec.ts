import { expect, test } from '@playwright/test';

const patientUser = {
  _id: 'patient-1',
  name: 'John Doe',
  email: 'john.doe@dentacare.example',
  phone: '0710000101',
  idNumber: '9001015009001',
  role: 'PATIENT',
  isActive: true
};

test.describe('authentication', () => {
  test('logs a sample patient in and opens the patient portal', async ({ page }) => {
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
    await page.getByRole('button', { name: 'Patient · John Doe' }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/patient\/appointments$/);
    await expect(page.getByRole('heading', { name: 'My appointments' })).toBeVisible();
    await expect(page.getByText('No appointments found yet.')).toBeVisible();
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
