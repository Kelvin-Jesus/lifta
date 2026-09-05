import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = '/Users/kj/.gemini/antigravity-ide/brain/df8586c1-bfdf-4788-b965-8c6526c17dfe/visual_inspections';

async function run() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // 1. Home Dashboard
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_home_dashboard.png') });
  console.log('Captured: 01_home_dashboard.png');

  // Check routines length
  const heroRoutineName = await page.locator('[data-testid="hero-routine-name"]').textContent().catch(() => 'NOT FOUND');
  console.log('Hero routine text:', heroRoutineName);

  // 2. Routines Tab
  const routinesTab = page.locator('[data-testid="tab-routines"]');
  if (await routinesTab.isVisible()) {
    await routinesTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_routines_tab.png') });
    console.log('Captured: 02_routines_tab.png');
  }

  // 3. History Tab
  const historyTab = page.locator('[data-testid="tab-history"]');
  if (await historyTab.isVisible()) {
    await historyTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_history_tab.png') });
    console.log('Captured: 03_history_tab.png');
  }

  // 4. Exercises / Catalog Tab
  const exercisesTab = page.locator('[data-testid="tab-exercises"]');
  if (await exercisesTab.isVisible()) {
    await exercisesTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_exercises_tab.png') });
    console.log('Captured: 04_exercises_tab.png');
  }

  // 5. Settings Tab
  const settingsTab = page.locator('[data-testid="tab-settings"]');
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_settings_dark.png') });
    console.log('Captured: 05_settings_dark.png');

    // Test Theme toggle to Light iOS
    const lightBtn = page.locator('[data-testid="btn-theme-light"]');
    if (await lightBtn.isVisible()) {
      console.log('Clicking Light iOS theme button...');
      await lightBtn.click();
      await page.waitForTimeout(800);
      const rootTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      const bodyTheme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      console.log(`Themes after click -> html data-theme: ${rootTheme}, body data-theme: ${bodyTheme}`);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_settings_light.png') });
      console.log('Captured: 06_settings_light.png');

      // Go back to Train tab to see home in Light theme!
      const trainTab = page.locator('[data-testid="tab-train"]');
      await trainTab.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_home_light.png') });
      console.log('Captured: 07_home_light.png');

      // Switch back to Dark
      await settingsTab.click();
      await page.waitForTimeout(300);
      await page.locator('[data-testid="btn-theme-dark"]').click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Workout Deck
  await page.locator('[data-testid="tab-train"]').click();
  await page.waitForTimeout(500);
  const startBtn = page.locator('[data-testid="btn-start-hero-workout"]');
  if (await startBtn.isVisible()) {
    console.log('Starting workout...');
    await startBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_workout_deck.png') });
    console.log('Captured: 08_workout_deck.png');

    // Complete a set
    const completeSetBtn = page.locator('[data-testid="btn-complete-next-set"]').first();
    if (await completeSetBtn.isVisible()) {
      await completeSetBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_workout_rest_timer.png') });
      console.log('Captured: 09_workout_rest_timer.png');
    }
  }

  await browser.close();
  console.log('Visual inspection finished!');
}

run().catch((err) => {
  console.error('Error running visual inspection:', err);
  process.exit(1);
});
