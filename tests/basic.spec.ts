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
  await page.getByRole('button', { name: 'Remove division' }).last().click();
  await expect(divisionInputs).toHaveCount(2);

  const teamInputs = page.getByPlaceholder('Team name');
  await expect(teamInputs).toHaveCount(8);
  await page.getByRole('button', { name: 'Add Team' }).first().click();
  await expect(teamInputs).toHaveCount(9);
  const newTeam = teamInputs.last();
  await newTeam.fill('Temp');
  await page.getByRole('button', { name: 'Remove team' }).last().click();
  await expect(teamInputs).toHaveCount(8);

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
