import { expect, test } from '@playwright/test';

async function chooseFirstOption(page: any, controlName: string) {
  const select = page.locator(`[formcontrolname="${controlName}"]`);
  await select.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
}

test('staff booking uses the protected staff endpoint and does not prefill staff identity', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'staff-e2e',
      name: 'E2E Demo Staff',
      email: 'staff@test.invalid',
      role: 'RECEPTIONIST',
      isActive: true
    }));
  });

  await page.route('**/api/master-data**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      services: [{ value: 'checkup', label: 'Demo Check-up' }],
      timeSlots: [{ value: 'morning', label: '09:00' }],
      branches: [{ value: 'main', label: 'Demo Main Clinic' }],
      appointmentStatuses: [{ value: 'CONFIRMED', label: 'Confirmed' }]
    })
  }));
  await page.route('**/api/dentists**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ _id: 'dentist-e2e', name: 'Dr Demo E2E' }])
  }));

  let requestUrl = '';
  await page.route('**/api/appointments/staff', async (route) => {
    requestUrl = route.request().url();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ _id: 'booking-e2e' }) });
  });

  await page.goto('/appointment');
  await expect(page.locator('[formcontrolname="patientName"]')).toHaveValue('');
  await expect(page.locator('[formcontrolname="email"]')).toHaveValue('');

  await chooseFirstOption(page, 'branchId');
  await chooseFirstOption(page, 'serviceId');
  await chooseFirstOption(page, 'dentistId');
  await page.locator('[formcontrolname="date"]').fill('2099-12-20');
  await chooseFirstOption(page, 'slotId');
  await chooseFirstOption(page, 'status');
  await page.locator('[formcontrolname="patientName"]').fill('E2E Demo Patient');
  await page.locator('[formcontrolname="idNumber"]').fill('0000000000000');
  await page.locator('[formcontrolname="phone"]').fill('0710000000');
  await page.locator('[formcontrolname="email"]').fill('patient@test.invalid');
  await page.locator('[formcontrolname="reason"]').fill('E2E demo booking');

  await page.getByRole('button', { name: 'Confirm appointment' }).click();
  await expect.poll(() => requestUrl).toContain('/api/appointments/staff');
});
