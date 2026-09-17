import { expect, test } from '@playwright/test';

const masterData = {
  branches: [{ value: 'main', label: 'Main Clinic' }],
  services: [{ value: 'checkup', label: 'Dental Check-up' }],
  timeSlots: [{ value: '09:00', label: '09:00' }],
  appointmentStatuses: [{ value: 'CONFIRMED', label: 'Confirmed' }]
};

async function chooseFirstSelectOption(page: any, controlName: string) {
  const select = page.locator(`[formcontrolname="${controlName}"]`);
  await select.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
}

async function chooseFutureDate(page: any, days = 10) {
  const target = new Date();
  target.setHours(12, 0, 0, 0);
  target.setDate(target.getDate() + days);
  const ariaLabel = target.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  await page.getByLabel('Open calendar').click();
  await page.getByRole('button', { name: ariaLabel, exact: true }).click();
}

test('staff booking uses live autocomplete and the protected staff endpoint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        _id: 'staff-e2e',
        name: 'Sample Staff',
        email: 'staff@test.invalid',
        role: 'RECEPTIONIST',
        isActive: true
      })
    );
  });

  await page.route('**/api/master-data/**', (route) => {
    const url = new URL(route.request().url());
    const key = url.pathname.split('/').pop() as keyof typeof masterData;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ key, description: key, items: masterData[key] || [] })
    });
  });

  await page.route('**/api/dentists**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ _id: 'dentist-e2e', name: 'Dr Sample' }])
    })
  );

  let requestUrl = '';
  await page.route('**/api/appointments/staff', async (route) => {
    requestUrl = route.request().url();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ _id: 'booking-e2e' })
    });
  });

  await page.goto('/appointment');
  await expect(page.locator('[formcontrolname="patientName"]')).toHaveValue('');
  await expect(page.locator('[formcontrolname="email"]')).toHaveValue('');
  await expect(page.locator('[formcontrolname="date"]')).toHaveAttribute('readonly', '');

  await page.getByPlaceholder('Search branches').fill('Main');
  await page.getByRole('option', { name: 'Main Clinic' }).click();
  await page.getByPlaceholder('Search services').fill('Check');
  await page.getByRole('option', { name: 'Dental Check-up' }).click();
  await page.getByPlaceholder('Search dentists').fill('Sample');
  await page.getByRole('option', { name: 'Dr Sample' }).click();
  await chooseFutureDate(page);
  await page.getByPlaceholder('Search times').fill('09');
  await page.getByRole('option', { name: '09:00' }).click();
  await chooseFirstSelectOption(page, 'status');

  await page.locator('[formcontrolname="patientName"]').fill('Sample Patient');
  await page.locator('[formcontrolname="idNumber"]').fill('0000000000000');
  await page.locator('[formcontrolname="phone"]').fill('0710000000');
  await page.locator('[formcontrolname="email"]').fill('patient@test.invalid');
  await page.locator('[formcontrolname="reason"]').fill('Routine staff booking');

  await page.getByRole('button', { name: 'Confirm appointment' }).click();
  await expect.poll(() => requestUrl).toContain('/api/appointments/staff');
});
