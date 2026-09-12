const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Replays one scripted interaction step. Missing selectors are skipped
 * instead of failing so the harness never blocks on cosmetic markup changes.
 */
export const performInteraction = async (page, step) => {
  if (step.type === 'scroll') {
    for (let i = 0; i < 12; i += 1) {
      await page.mouse.wheel({ deltaY: 120 });
      await sleep(40);
    }
    await sleep(250);
    for (let i = 0; i < 12; i += 1) {
      await page.mouse.wheel({ deltaY: -120 });
      await sleep(40);
    }
    await sleep(250);
    return;
  }

  if (step.type === 'tap') {
    const handle = await page.$(step.selector);
    if (!handle) return;
    await handle.click().catch(() => {});
    await sleep(400);
    return;
  }

  if (step.type === 'typeSearch') {
    const handle = await page.$(step.selector);
    if (!handle) return;
    await handle.click().catch(() => {});
    await page.keyboard.type(step.text, { delay: 90 });
    await sleep(600);
    for (let i = 0; i < step.text.length; i += 1) await page.keyboard.press('Backspace');
    await sleep(600);
    return;
  }

  if (step.type === 'swipe') {
    const handle = await page.$(step.selector);
    if (!handle) return;
    const box = await handle.boundingBox();
    if (!box) return;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.85, y);
    await page.mouse.down();
    for (let i = 0; i <= 10; i += 1) {
      await page.mouse.move(box.x + box.width * (0.85 - 0.07 * i), y);
      await sleep(16);
    }
    await page.mouse.up();
    await sleep(600);
  }
};
