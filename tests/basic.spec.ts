import { test, expect } from '@playwright/test';

test('allows schedule generation and team/division management', async ({ page }) => {
  await page.route('**/api/generate-schedule', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        matchups: [
          { matchups: [{ team1: { name: 'Team 1' }, team2: { name: 'Team 2' } }] }
        ]
      }),
    });
  });

  await page.goto('/');

  const divisionInputs = page.getByPlaceholder('Division name');
  await expect(divisionInputs).toHaveCount(2);
  await page.getByRole('button', { name: 'Add Division' }).click();
  await expect(divisionInputs).toHaveCount(3);
  await divisionInputs.last().locator('..').getByRole('button', { name: 'Remove' }).click();
  await expect(divisionInputs).toHaveCount(2);

  const teamInputs = page.getByPlaceholder('Team name');
  await expect(teamInputs).toHaveCount(10);
  await page.getByRole('button', { name: 'Add Team' }).click();
  await expect(teamInputs).toHaveCount(11);
  const newTeam = teamInputs.last();
  await newTeam.fill('Temp');
  await newTeam.locator('..').getByRole('button', { name: 'Remove' }).click();
  await expect(teamInputs).toHaveCount(10);

  await page.getByLabel('Play teams in division twice').check();
  await page.getByLabel('Play teams out of division once').check();
  const weeksInput = page.getByLabel('Number of weeks');
  await weeksInput.fill('12');
  await expect(weeksInput).toHaveValue('12');

  await page.getByRole('button', { name: 'Generate Schedule' }).click();
  await expect(page.getByText('Week 1')).toBeVisible();
  await expect(page.getByText('Team 1')).toBeVisible();
  await expect(page.getByText('Team 2')).toBeVisible();
});
