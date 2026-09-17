import { expect, test } from '@playwright/test';

test('submits a complete public demo appointment', async ({ page }) => {
  await page.route('**/api/master-data**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        services: [{ value: 'cleaning', label: 'Demo Dental Cleaning' }],
        timeSlots: [{ value: 'slot-0900', label: '09:00' }],
        branches: [{ value: 'sandton', label: 'Demo Sandton Clinic' }],
        appointmentStatuses: [{ value: 'PENDING', label: 'Pending' }]
      })
    });
  });
  await page.route('**/api/dentists**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ _id: 'dentist-1', name: 'Dr Demo Dentist', specialization: 'Demo General Dentistry' }])
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

  await page.locator('[formcontrolname="branchId"]').click();
  await page.getByRole('option', { name: 'Demo Sandton Clinic' }).click();
  await page.locator('[formcontrolname="serviceId"]').click();
  await page.getByRole('option', { name: 'Demo Dental Cleaning' }).click();
  await page.locator('[formcontrolname="dentistId"]').click();
  await page.getByRole('option', { name: /Dr Demo Dentist/ }).click();
  await page.locator('[formcontrolname="date"]').fill('2099-12-20');
  await page.locator('[formcontrolname="slotId"]').click();
  await page.getByRole('option', { name: '09:00' }).click();

  await page.locator('[formcontrolname="patientName"]').fill('Demo Patient');
  await page.locator('[formcontrolname="idNumber"]').fill('0000000000000');
  await page.locator('[formcontrolname="phone"]').fill('0710000000');
  await page.locator('[formcontrolname="email"]').fill('demo@test.invalid');
  await page.locator('[formcontrolname="reason"]').fill('Demo routine check-up');
  await page.locator('[formcontrolname="notes"]').fill('Fictional test visit');

  await page.getByRole('button', { name: 'Confirm appointment' }).click();

  await expect.poll(() => submittedBody).toBeTruthy();
  expect(submittedBody).toMatchObject({
    serviceId: 'cleaning',
    serviceName: 'Demo Dental Cleaning',
    dentistId: 'dentist-1',
    dentistName: 'Dr Demo Dentist',
    branchId: 'sandton',
    branchName: 'Demo Sandton Clinic',
    slotId: 'slot-0900',
    time: '09:00',
    patientName: 'Demo Patient',
    idNumber: '0000000000000',
    phone: '0710000000',
    email: 'demo@test.invalid',
    reason: 'Demo routine check-up',
    durationMinutes: 30
  });
  await expect(page.getByText('Your appointment has been booked successfully.')).toBeVisible();
});
