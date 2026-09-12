/**
 * PWA Service Worker Registration.
 *
 * The worker calls skipWaiting/clients.claim, so a new build can take control
 * of an already-open tab. That tab is still running the previous bundle, which
 * is how shipped fixes appeared to "not apply": reload once, exactly once, when
 * control changes and a worker was already in charge.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !navigator.serviceWorker.controller) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Pick up a new deployment while the app stays open.
        reg.update().catch(() => {});
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[Lifta PWA] Nova versão instalada; recarregando.');
            }
          };
        };
      })
      .catch((err) => {
        console.warn('[Lifta PWA] Falha ao registrar Service Worker:', err);
      });
  });
}
