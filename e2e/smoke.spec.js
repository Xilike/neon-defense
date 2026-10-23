import { test, expect } from '@playwright/test';
test('game loads on mobile viewport without uncaught page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#game')).toBeVisible();
  await expect(page).toHaveTitle(/NEON DEFENSE/i);
  expect(errors).toEqual([]);
});
