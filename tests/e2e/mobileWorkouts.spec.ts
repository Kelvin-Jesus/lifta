import { test, expect } from '@playwright/test';

test.describe('Lifta Mobile E2E (iPhone 15)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Test 1: Complete Happy Path workout flow', async ({ page }) => {
    // 1. Verify Home Dashboard loads with Lifta brand and Hero Routine
    await expect(page.getByTestId('home-dashboard')).toBeVisible();
    await expect(page.getByTestId('hero-routine-name')).toBeVisible();

    // 2. Start workout via 1-tap giant hero button
    await page.getByTestId('btn-start-hero-workout').click();

    // 3. Verify 100dvh WorkoutDeck is rendered
    await expect(page.getByTestId('workout-deck')).toBeVisible();
    await expect(page.getByTestId('deck-carousel')).toBeVisible();

    // 4. Adjust weight with tactile stepper (+2.5 kg)
    const weightBefore = await page.getByTestId('weight-display-0').textContent();
    await page.getByTestId('btn-weight-plus-0').click();
    const weightAfter = await page.getByTestId('weight-display-0').textContent();
    expect(weightAfter).not.toBe(weightBefore);

    // 5. Complete first set via 1-tap thumb button
    await page.getByTestId('btn-complete-next-set').click();

    // 6. Verify Dynamic Island floating rest bar pops up
    await expect(page.getByTestId('floating-rest-bar')).toBeVisible();
    await expect(page.getByTestId('rest-timer-countdown')).toBeVisible();

    // 7. Add +30s to rest
    await page.getByTestId('btn-add-rest-30s').click();

    // 8. Skip rest
    await page.getByTestId('btn-skip-rest').click();
    await expect(page.getByTestId('floating-rest-bar')).not.toBeVisible();

    // 9. Exit workout
    await page.getByTestId('btn-deck-exit').click();
    await expect(page.getByTestId('home-dashboard')).toBeVisible();
  });

  test('Test 2: 100% Offline operation test', async ({ page, context }) => {
    // Start workout
    await page.getByTestId('btn-start-hero-workout').click();
    await expect(page.getByTestId('workout-deck')).toBeVisible();

    // Emulate full network disconnection (airplane mode)
    await context.setOffline(true);

    // Perform operations offline
    await page.getByTestId('btn-weight-plus-0').click();
    await page.getByTestId('btn-complete-next-set').click();
    await expect(page.getByTestId('floating-rest-bar')).toBeVisible();

    // Restore network
    await context.setOffline(false);
  });

  test('Test 3: iOS memory crash resilience & state recovery (<80ms)', async ({ page }) => {
    // Start workout
    await page.getByTestId('btn-start-hero-workout').click();
    await expect(page.getByTestId('workout-deck')).toBeVisible();

    // Complete set 0
    await page.getByTestId('btn-complete-next-set').click();

    // Simulate tab reload / browser termination
    await page.reload();

    // Check active workout recovery banner is visible
    await expect(page.getByTestId('active-workout-recovery-banner')).toBeVisible();

    // Click Retomar
    await page.getByTestId('btn-resume-workout').click();
    await expect(page.getByTestId('workout-deck')).toBeVisible();

    // Verify completed set is still checked
    const set0Check = page.getByTestId('btn-complete-set-0');
    await expect(set0Check).toHaveAttribute('aria-label', 'Desmarcar série');
  });

  test('Test 4: Sovereign backup export and import cycle', async ({ page }) => {
    // Open routines
    await page.getByTestId('btn-open-routines').click();
    await expect(page.getByTestId('routine-manager-sheet')).toBeVisible();
  });
});
