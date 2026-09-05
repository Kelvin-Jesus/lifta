/**
 * PWA Service Worker Registration with update listener
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register in production or when supported
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.info('[Lifta PWA] Nova versão disponível em cache.');
            }
          };
        };
      })
      .catch((err) => {
        console.warn('[Lifta PWA] Falha ao registrar Service Worker:', err);
      });
  });
}
