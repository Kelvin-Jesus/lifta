#!/usr/bin/env node
/**
 * Attribution helper for the perf gates: replays a route's scripted
 * interactions under CPU throttling and reports the Long Animation Frames
 * (LoAF) responsible for dropped frames, with script and style/layout
 * attribution.
 *
 *   node scripts/perf/diagnose.mjs workout
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import { startStaticServer } from './server.mjs';
import { MOBILE_DEVICE, CPU_THROTTLE_RATE, ROUTES } from './config.mjs';
import { performInteraction } from './interactions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const routeId = process.argv[2] ?? 'train';
const route = ROUTES.find((r) => r.id === routeId);
if (!route) throw new Error(`Unknown route: ${routeId}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `(() => {
  window.__loaf = [];
  window.__frames = [];
  const marker = document.createElement('div');
  marker.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0.01;pointer-events:none;will-change:transform;z-index:2147483647';
  document.body.appendChild(marker);
  let last = performance.now();
  let n = 0;
  const tick = (now) => {
    window.__frames.push(now - last);
    last = now;
    n += 1;
    marker.style.transform = 'translateX(' + (n % 2) + 'px)';
    requestAnimationFrame(tick);
  };
  requestAnimationFrame((now) => { last = now; requestAnimationFrame(tick); });
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__loaf.push({
          duration: Math.round(entry.duration),
          blockingDuration: Math.round(entry.blockingDuration),
          renderDuration: Math.round(entry.startTime + entry.duration - entry.renderStart),
          styleAndLayout: Math.round(entry.styleAndLayoutDuration),
          scripts: entry.scripts.map((s) => ({
            invoker: s.invoker,
            source: s.sourceURL ? s.sourceURL.split('/').pop() : '',
            fn: s.sourceFunctionName,
            duration: Math.round(s.duration),
            forcedStyle: Math.round(s.forcedStyleAndLayoutDuration ?? 0),
          })),
        });
      }
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) { window.__loafError = String(e); }
})()`;

const main = async () => {
  const server = await startStaticServer(path.join(ROOT, 'dist'), Number(process.env.PERF_PORT ?? 4274));
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--hide-scrollbars'] });
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${chrome.port}`,
    defaultViewport: null,
  });

  try {
    if (route.requiresActiveWorkout) {
      const seed = await browser.newPage();
      await seed.goto(`${server.origin}/?tab=train`, { waitUntil: 'networkidle2' });
      await seed.waitForSelector('[data-testid="btn-start-hero-workout"]');
      await seed.click('[data-testid="btn-start-hero-workout"]');
      await seed.waitForSelector('[data-testid="workout-deck"]');
      await sleep(500);
      await seed.close();
    }

    const page = await browser.newPage();
    const client = await page.createCDPSession();
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: MOBILE_DEVICE.width,
      height: MOBILE_DEVICE.height,
      deviceScaleFactor: MOBILE_DEVICE.deviceScaleFactor,
      mobile: true,
    });
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await page.goto(`${server.origin}${route.url}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector(route.waitFor, { timeout: 30_000 }).catch(() => {});
    await sleep(800);
    if (process.env.BLOCK_GIFS === '1') {
      await client.send('Network.enable');
      await client.send('Network.setBlockedURLs', { urls: ['*.gif'] });
    }
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE_RATE });
    await page.evaluate(PROBE);
    await page.mouse.move(MOBILE_DEVICE.width / 2, MOBILE_DEVICE.height / 2);

    for (const step of route.interactions) {
      const before = await page.evaluate(() => [window.__loaf.length, window.__frames.length]);
      await performInteraction(page, step);
      const { entries, frames } = await page.evaluate(
        ([loafFrom, frameFrom]) => ({
          entries: window.__loaf.slice(loafFrom),
          frames: window.__frames.slice(frameFrom),
        }),
        before
      );
      const dropped = frames.filter((d) => d > 20);
      const worst = entries.sort((a, b) => b.duration - a.duration).slice(0, 3);
      process.stdout.write(
        `\n· ${step.type}${step.selector ? ` ${step.selector}` : ''}` +
          ` — ${frames.length} frames, ${dropped.length} over 20ms` +
          `${dropped.length ? ` (worst ${Math.round(Math.max(...dropped))}ms)` : ''}\n`
      );
      for (const e of worst) {
        process.stdout.write(
          `    frame ${e.duration}ms (blocking ${e.blockingDuration}ms, render ${e.renderDuration}ms, style+layout ${e.styleAndLayout}ms)\n`
        );
        for (const s of e.scripts.slice(0, 3)) {
          process.stdout.write(
            `      script ${s.duration}ms ${s.invoker} ${s.source}:${s.fn} forcedLayout=${s.forcedStyle}ms\n`
          );
        }
      }
    }
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await page.close();
  } finally {
    await browser.disconnect();
    await chrome.kill();
    await server.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
