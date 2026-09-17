import { expect, test } from '@playwright/test';

const masterData = {
  branches: [{ value: 'sandton', label: 'Sandton Clinic' }],
  services: [{ value: 'cleaning', label: 'Dental Cleaning' }],
  timeSlots: [{ value: '09:00', label: '09:00' }],
  appointmentStatuses: [{ value: 'PENDING', label: 'Pending' }]
};

function addDays(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function chooseFutureDate(page: any, days = 7): Promise<string> {
  const target = addDays(days);
  const ariaLabel = target.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  await page.getByLabel('Open calendar').click();
  await page.getByRole('button', { name: ariaLabel, exact: true }).click();
  return toIsoDate(target);
}

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

  const dateInput = page.locator('[formcontrolname="date"]');
  await expect(dateInput).toHaveAttribute('readonly', '');
  await page.getByLabel('Open calendar').click();
  await expect(page.getByLabel('Previous month')).toBeDisabled();
  await page.keyboard.press('Escape');

  await page.getByPlaceholder('Search branches').fill('Sand');
  await page.getByRole('option', { name: 'Sandton Clinic' }).click();
  await page.getByPlaceholder('Search services').fill('Clean');
  await page.getByRole('option', { name: 'Dental Cleaning' }).click();
  await page.getByPlaceholder('Search dentists').fill('Maya');
  await page.getByRole('option', { name: /Dr Maya Vale/ }).click();
  const selectedDate = await chooseFutureDate(page);
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
    date: selectedDate,
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
