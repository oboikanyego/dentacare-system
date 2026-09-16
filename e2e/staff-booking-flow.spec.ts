import { expect, test } from '@playwright/test';

test('staff booking uses the protected staff endpoint and does not prefill staff identity', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'staff-e2e',
      name: 'E2E Staff',
      email: 'staff@test.invalid',
      role: 'RECEPTIONIST',
      isActive: true
    }));
  });

  await page.route('**/api/master-data**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      services: [{ value: 'checkup', label: 'Check-up' }],
      timeSlots: [{ value: 'morning', label: '09:00' }],
      branches: [{ value: 'main', label: 'Main Clinic' }],
      appointmentStatuses: [{ value: 'CONFIRMED', label: 'Confirmed' }]
    })
  }));
  await page.route('**/api/dentists**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ _id: 'dentist-e2e', name: 'Dr E2E' }])
  }));

  let requestUrl = '';
  await page.route('**/api/appointments/staff', async (route) => {
    requestUrl = route.request().url();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ _id: 'booking-e2e' }) });
  });

  await page.goto('/appointment');
  await expect(page.locator('[formcontrolname="patientName"]')).toHaveValue('');
  await expect(page.locator('[formcontrolname="email"]')).toHaveValue('');

  await page.locator('[formcontrolname="branchId"]').click();
  await page.getByRole('option', { name: 'Main Clinic' }).click();
  await page.locator('[formcontrolname="serviceId"]').click();
  await page.getByRole('option', { name: 'Check-up' }).click();
  await page.locator('[formcontrolname="dentistId"]').click();
  await page.getByRole('option', { name: 'Dr E2E' }).click();
  await page.locator('[formcontrolname="date"]').fill('2099-12-20');
  await page.locator('[formcontrolname="slotId"]').click();
  await page.getByRole('option', { name: '09:00' }).click();
  await page.locator('[formcontrolname="status"]').click();
  await page.getByRole('option', { name: 'Confirmed' }).click();
  await page.locator('[formcontrolname="patientName"]').fill('E2E Patient');
  await page.locator('[formcontrolname="idNumber"]').fill('0000000000000');
  await page.locator('[formcontrolname="phone"]').fill('0710000000');
  await page.locator('[formcontrolname="email"]').fill('patient@test.invalid');
  await page.locator('[formcontrolname="reason"]').fill('E2E booking');

  await page.getByRole('button', { name: 'Confirm appointment' }).click();
  await expect.poll(() => requestUrl).toContain('/api/appointments/staff');
});
