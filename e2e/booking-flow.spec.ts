import { expect, test } from '@playwright/test';

const masterData = {
  branches: [{ value: 'sandton', label: 'Sandton Clinic' }],
  services: [{ value: 'cleaning', label: 'Dental Cleaning' }],
  timeSlots: [{ value: '09:00', label: '09:00' }],
  appointmentStatuses: [{ value: 'PENDING', label: 'Pending' }]
};

test('submits a complete public appointment using live autocomplete data', async ({ page }) => {
  await page.route('**/api/master-data/**', async (route) => {
    const url = new URL(route.request().url());
    const key = url.pathname.split('/').pop() as keyof typeof masterData;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ key, description: key, items: masterData[key] || [] })
    });
  });

  await page.route('**/api/dentists**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'dentist-1',
          name: 'Dr Maya Vale',
          specialization: 'General Dentistry'
        }
      ])
    });
  });

  let submittedBody: Record<string, unknown> | undefined;
  await page.route('**/api/appointments', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    submittedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ _id: 'appointment-1', ...submittedBody })
    });
  });

  await page.goto('/appointment');

  await page.getByPlaceholder('Search branches').fill('Sand');
  await page.getByRole('option', { name: 'Sandton Clinic' }).click();
  await page.getByPlaceholder('Search services').fill('Clean');
  await page.getByRole('option', { name: 'Dental Cleaning' }).click();
  await page.getByPlaceholder('Search dentists').fill('Maya');
  await page.getByRole('option', { name: /Dr Maya Vale/ }).click();
  await page.locator('[formcontrolname="date"]').fill('2099-12-20');
  await page.getByPlaceholder('Search times').fill('09');
  await page.getByRole('option', { name: '09:00' }).click();

  await page.locator('[formcontrolname="patientName"]').fill('John Doe');
  await page.locator('[formcontrolname="idNumber"]').fill('9001015009001');
  await page.locator('[formcontrolname="phone"]').fill('0710000101');
  await page.locator('[formcontrolname="email"]').fill('john.doe@dentacare.example');
  await page.locator('[formcontrolname="reason"]').fill('Routine check-up');
  await page.locator('[formcontrolname="notes"]').fill('Fictional test visit');

  await page.getByRole('button', { name: 'Confirm appointment' }).click();

  await expect.poll(() => submittedBody).toBeTruthy();
  expect(submittedBody).toMatchObject({
    serviceId: 'cleaning',
    serviceName: 'Dental Cleaning',
    dentistId: 'dentist-1',
    dentistName: 'Dr Maya Vale',
    branchId: 'sandton',
    branchName: 'Sandton Clinic',
    slotId: '09:00',
    time: '09:00',
    patientName: 'John Doe',
    idNumber: '9001015009001',
    phone: '0710000101',
    email: 'john.doe@dentacare.example',
    reason: 'Routine check-up',
    durationMinutes: 30
  });
  await expect(page.getByText('Your appointment has been booked successfully.')).toBeVisible();
});
