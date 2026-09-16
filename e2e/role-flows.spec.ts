import { expect, test } from '@playwright/test';

function authResponse(role: 'ADMIN' | 'RECEPTIONIST' | 'PATIENT') {
  return {
    token: `${role.toLowerCase()}-token`,
    user: {
      _id: `${role.toLowerCase()}-1`,
      name: `${role} Demo User`,
      email: `${role.toLowerCase()}@test.invalid`,
      phone: '0710000000',
      idNumber: '0000000000000',
      role,
      isActive: true
    }
  };
}

async function loginAs(page: any, role: 'ADMIN' | 'RECEPTIONIST' | 'PATIENT') {
  await page.route('**/api/auth/login', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authResponse(role))
    });
  });

  await page.goto('/login');
  await page.locator('input[formcontrolname="email"]').fill(`${role.toLowerCase()}@test.invalid`);
  await page.locator('input[formcontrolname="password"]').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('role based journeys', () => {
  test('admin lands on demo user management with masked personal fields', async ({ page }) => {
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'staff-1',
            name: 'Reception Demo User',
            email: 'reception@test.invalid',
            phone: '0710000000',
            idNumber: '0000000000000',
            role: 'RECEPTIONIST',
            isActive: true
          }
        ])
      });
    });
    await page.route('**/api/master-data/userRoles', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          key: 'userRoles',
          description: 'Roles',
          items: [
            { value: 'RECEPTIONIST', label: 'Receptionist' },
            { value: 'DENTIST', label: 'Dentist' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'PATIENT', label: 'Patient' }
          ]
        })
      });
    });

    await loginAs(page, 'ADMIN');

    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByRole('heading', { name: 'Demo user management' })).toBeVisible();
    await expect(page.getByText('R••• D••• U•••')).toBeVisible();
    await expect(page.getByText('reception@test.invalid')).toHaveCount(0);
  });

  test('receptionist lands on demo staff bookings', async ({ page }) => {
    await page.route('**/api/appointments', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/master-data/timeSlots', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ key: 'timeSlots', description: 'Demo slots', items: [] }) });
    });

    await loginAs(page, 'RECEPTIONIST');

    await expect(page).toHaveURL(/\/staff\/bookings$/);
    await expect(page.getByRole('heading', { name: 'Demo bookings' })).toBeVisible();
    await expect(page.getByText('No demo bookings found.')).toBeVisible();
  });

  test('patient cannot open admin user management', async ({ page }) => {
    await page.addInitScript((session) => {
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));
    }, authResponse('PATIENT'));
    await page.route('**/api/appointments/mine', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/admin/users');

    await expect(page).toHaveURL(/\/patient\/appointments$/);
    await expect(page.getByRole('heading', { name: 'My demo appointments' })).toBeVisible();
  });
});
