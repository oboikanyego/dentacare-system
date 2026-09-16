import { expect, test } from '@playwright/test';

test('submits a complete public appointment with the selected clinic data', async ({ page }) => {
  await page.route('**/api/master-data**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        services: [{ value: 'cleaning', label: 'Dental Cleaning' }],
        timeSlots: [{ value: 'slot-0900', label: '09:00' }],
        branches: [{ value: 'sandton', label: 'Sandton Clinic' }],
        appointmentStatuses: [{ value: 'PENDING', label: 'Pending' }]
      })
    });
  });
  await page.route('**/api/dentists**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ _id: 'dentist-1', name: 'Dr Test Dentist', specialization: 'General Dentistry' }])
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
  await page.getByRole('option', { name: 'Sandton Clinic' }).click();
  await page.locator('[formcontrolname="serviceId"]').click();
  await page.getByRole('option', { name: 'Dental Cleaning' }).click();
  await page.locator('[formcontrolname="dentistId"]').click();
  await page.getByRole('option', { name: /Dr Test Dentist/ }).click();
  await page.locator('[formcontrolname="date"]').fill('2099-12-20');
  await page.locator('[formcontrolname="slotId"]').click();
  await page.getByRole('option', { name: '09:00' }).click();

  await page.locator('[formcontrolname="patientName"]').fill('Playwright Patient');
  await page.locator('[formcontrolname="idNumber"]').fill('9001015009087');
  await page.locator('[formcontrolname="phone"]').fill('0712345678');
  await page.locator('[formcontrolname="email"]').fill('patient@example.com');
  await page.locator('[formcontrolname="reason"]').fill('Routine check-up and cleaning');
  await page.locator('[formcontrolname="notes"]').fill('First visit');

  await page.getByRole('button', { name: 'Confirm appointment' }).click();

  await expect.poll(() => submittedBody).toBeTruthy();
  expect(submittedBody).toMatchObject({
    serviceId: 'cleaning',
    serviceName: 'Dental Cleaning',
    dentistId: 'dentist-1',
    dentistName: 'Dr Test Dentist',
    branchId: 'sandton',
    branchName: 'Sandton Clinic',
    slotId: 'slot-0900',
    time: '09:00',
    patientName: 'Playwright Patient',
    idNumber: '9001015009087',
    phone: '0712345678',
    email: 'patient@example.com',
    reason: 'Routine check-up and cleaning',
    durationMinutes: 30
  });
  await expect(page.getByText('Your appointment has been booked successfully.')).toBeVisible();
});
