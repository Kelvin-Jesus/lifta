#!/usr/bin/env node
/**
 * Low-end mobile performance audit.
 *
 * For every screen of the app (see `config.mjs`) it runs:
 *   1. a Lighthouse mobile navigation (Moto G Power emulation, 4x CPU
 *      slowdown, simulated Slow 4G) against the production build, and
 *   2. a scripted interaction pass under the same CPU throttling that
 *      samples animation frames and long tasks.
 *
 * Results land in `.scratch/perf/report.json`; the process exits non-zero
 * when any gate fails.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import lighthouse from 'lighthouse';
import { startStaticServer } from './server.mjs';
import { performInteraction } from './interactions.mjs';
import { GATES, MOBILE_DEVICE, CPU_THROTTLE_RATE, ROUTES } from './config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, '.scratch/perf');
const PORT = Number(process.env.PERF_PORT ?? 4173);

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const routes = only.length ? ROUTES.filter((r) => only.includes(r.id)) : ROUTES;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

/** Starts a workout through the UI so `/?screen=workout` has state to resume. */
const seedActiveWorkout = async (browser, origin) => {
  const page = await browser.newPage();
  try {
    await page.goto(`${origin}/?tab=train`, { waitUntil: 'networkidle2', timeout: 60_000 });
    await page.waitForSelector('[data-testid="btn-start-hero-workout"]', { timeout: 30_000 });
    await page.click('[data-testid="btn-start-hero-workout"]');
    await page.waitForSelector('[data-testid="workout-deck"]', { timeout: 30_000 });
    await sleep(500);
  } finally {
    await page.close();
  }
};

/**
 * Clears everything Lighthouse would normally clear *except* IndexedDB, so a
 * seeded active workout survives a `disableStorageReset` run.
 */
const clearNonDurableStorage = async (browser, origin) => {
  const page = await browser.newPage();
  try {
    const client = await page.createCDPSession();
    await client.send('Storage.clearDataForOrigin', {
      origin,
      storageTypes: 'cookies,local_storage,service_workers,cache_storage,shader_cache,websql',
    });
    await client.send('Network.clearBrowserCache');
    await client.detach();
  } finally {
    await page.close();
  }
};

const runLighthouse = async (port, url, { disableStorageReset = false } = {}) => {
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
    formFactor: 'mobile',
    disableStorageReset,
  });
  const lhr = result.lhr;
  const scriptBytes = (lhr.audits['network-requests']?.details?.items ?? [])
    .filter((item) => item.resourceType === 'Script')
    .reduce((sum, item) => sum + (item.transferSize ?? 0), 0);

  return {
    score: Math.round((lhr.categories.performance.score ?? 0) * 100),
    totalBlockingTimeMs: Math.round(lhr.audits['total-blocking-time']?.numericValue ?? 0),
    firstContentfulPaintMs: Math.round(lhr.audits['first-contentful-paint']?.numericValue ?? 0),
    largestContentfulPaintMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? 0),
    speedIndexMs: Math.round(lhr.audits['speed-index']?.numericValue ?? 0),
    cumulativeLayoutShift: Number(
      (lhr.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3)
    ),
    scriptTransferBytes: scriptBytes,
    opportunities: (Object.values(lhr.audits) ?? [])
      .filter(
        (a) =>
          a.details?.type === 'opportunity' &&
          typeof a.numericValue === 'number' &&
          a.numericValue > 100
      )
      .map((a) => ({ id: a.id, savingsMs: Math.round(a.numericValue) }))
      .sort((a, b) => b.savingsMs - a.savingsMs)
      .slice(0, 6),
  };
};

/**
 * Samples animation-frame cadence. A 1px compositor-only marker is mutated on
 * every frame so the browser keeps producing frames even when the app itself
 * is idle: without it, Chrome skips BeginFrames on a static page and the
 * resulting gaps look like dropped frames.
 */
const FRAME_PROBE = `(() => {
  window.__perf = { frames: [], longTasks: [] };
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perf.longTasks.push({ start: Math.round(entry.startTime), duration: Math.round(entry.duration) });
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch {}
  const marker = document.createElement('div');
  marker.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0.01;pointer-events:none;will-change:transform;z-index:2147483647';
  document.body.appendChild(marker);
  let last = performance.now();
  let n = 0;
  const tick = (now) => {
    window.__perf.frames.push(now - last);
    last = now;
    n += 1;
    marker.style.transform = 'translateX(' + (n % 2) + 'px)';
    window.__perf.raf = requestAnimationFrame(tick);
  };
  window.__perf.raf = requestAnimationFrame((now) => {
    last = now;
    marker.style.transform = 'translateX(1px)';
    window.__perf.raf = requestAnimationFrame(tick);
  });
})()`;

const runInteractionPass = async (browser, origin, route) => {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  try {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: MOBILE_DEVICE.width,
      height: MOBILE_DEVICE.height,
      deviceScaleFactor: MOBILE_DEVICE.deviceScaleFactor,
      mobile: true,
    });
    await client.send('Emulation.setUserAgentOverride', { userAgent: MOBILE_DEVICE.userAgent });
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

    await page.goto(`${origin}${route.url}`, { waitUntil: 'networkidle2', timeout: 60_000 });
    await page.waitForSelector(route.waitFor, { timeout: 30_000 }).catch(() => {});
    await sleep(800);

    // Throttle only while interacting: load cost is Lighthouse's job.
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE_RATE });
    await page.mouse.move(MOBILE_DEVICE.width / 2, MOBILE_DEVICE.height / 2);
    await page.evaluate(FRAME_PROBE);
    await sleep(300);

    for (const step of route.interactions) {
      await performInteraction(page, step);
    }

    const sample = await page.evaluate(() => {
      cancelAnimationFrame(window.__perf.raf);
      return { frames: window.__perf.frames, longTasks: window.__perf.longTasks };
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

    const frames = sample.frames.filter((d) => d > 0 && d < 5_000);
    const withinBudget = frames.filter((d) => d <= GATES.frameBudgetMs).length;
    const sorted = [...frames].sort((a, b) => a - b);
    const worstLongTask = sample.longTasks.reduce((max, t) => Math.max(max, t.duration), 0);

    return {
      frameCount: frames.length,
      framesWithinBudget: frames.length ? withinBudget / frames.length : 0,
      p95FrameMs: sorted.length ? Math.round(sorted[Math.floor(sorted.length * 0.95)] * 10) / 10 : 0,
      worstFrameMs: sorted.length ? Math.round(sorted[sorted.length - 1] * 10) / 10 : 0,
      longTaskCount: sample.longTasks.length,
      worstLongTaskMs: Math.round(worstLongTask),
      longTasksOverGate: sample.longTasks.filter((t) => t.duration > GATES.maxLongTaskMs).length,
    };
  } finally {
    await client.detach().catch(() => {});
    await page.close();
  }
};

const evaluateGates = (lh, frames) => {
  const checks = [
    { id: 'lighthouse-score', pass: lh.score >= GATES.minPerformanceScore, actual: lh.score, gate: `>= ${GATES.minPerformanceScore}` },
    { id: 'total-blocking-time', pass: lh.totalBlockingTimeMs <= GATES.maxTotalBlockingTimeMs, actual: `${lh.totalBlockingTimeMs} ms`, gate: `<= ${GATES.maxTotalBlockingTimeMs} ms` },
    { id: 'frames-within-budget', pass: frames.framesWithinBudget >= GATES.minFramesWithinBudget, actual: `${(frames.framesWithinBudget * 100).toFixed(1)}%`, gate: `>= ${GATES.minFramesWithinBudget * 100}%` },
    { id: 'long-tasks', pass: frames.longTasksOverGate === 0, actual: `${frames.worstLongTaskMs} ms worst`, gate: `none > ${GATES.maxLongTaskMs} ms` },
    { id: 'script-transfer', pass: lh.scriptTransferBytes <= GATES.maxScriptTransferBytes, actual: `${kb(lh.scriptTransferBytes)} KB`, gate: `<= ${kb(GATES.maxScriptTransferBytes)} KB` },
  ];
  return { checks, pass: checks.every((c) => c.pass) };
};

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const server = await startStaticServer(DIST, PORT);
  const chrome = await launch({
    chromeFlags: [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--mute-audio',
    ],
  });
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${chrome.port}`,
    defaultViewport: null,
  });

  const results = [];
  try {
    for (const route of routes) {
      process.stdout.write(`\n▶ ${route.id} (${route.url})\n`);
      if (route.requiresActiveWorkout) {
        await seedActiveWorkout(browser, server.origin);
        await clearNonDurableStorage(browser, server.origin);
      }
      const lh = await runLighthouse(chrome.port, `${server.origin}${route.url}`, {
        disableStorageReset: Boolean(route.requiresActiveWorkout),
      });
      const frames = await runInteractionPass(browser, server.origin, route);
      const gates = evaluateGates(lh, frames);
      results.push({ id: route.id, label: route.label, url: route.url, lighthouse: lh, interaction: frames, ...gates });

      for (const check of gates.checks) {
        process.stdout.write(
          `   ${check.pass ? '✓' : '✗'} ${check.id}: ${check.actual} (gate ${check.gate})\n`
        );
      }
    }
  } finally {
    await browser.disconnect();
    await chrome.kill();
    await server.close();
  }

  const report = {
    generatedAt: new Date().toISOString(),
    gates: GATES,
    device: MOBILE_DEVICE,
    cpuThrottleRate: CPU_THROTTLE_RATE,
    routes: results,
    pass: results.every((r) => r.pass),
  };
  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(
    path.join(OUT_DIR, 'routes.json'),
    `${JSON.stringify(ROUTES.map(({ id, label, url }) => ({ id, label, url })), null, 2)}\n`
  );

  const failing = results.filter((r) => !r.pass).map((r) => r.id);
  process.stdout.write(
    `\n${report.pass ? 'PASS' : 'FAIL'} — ${results.length - failing.length}/${results.length} routes within gates` +
      `${failing.length ? ` (failing: ${failing.join(', ')})` : ''}\n`
  );
  process.exit(report.pass ? 0 : 1);
};

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
