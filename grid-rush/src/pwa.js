const installBanner = document.querySelector('#install-banner');
const installButton = document.querySelector('#install-app');
const installDialog = document.querySelector('#install-dialog');
const offlineStatus = document.querySelector('#offline-status');
let installPrompt = null;

if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
  installBanner.hidden = true;
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installBanner.hidden = true;
  installDialog.close();
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) {
    installDialog.showModal();
    return;
  }
  const prompt = installPrompt;
  installPrompt = null;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') installBanner.hidden = true;
  } catch {
    installDialog.showModal();
  }
});

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { updateViaCache: 'none' });
      await navigator.serviceWorker.ready;
      offlineStatus.textContent = 'Ready to play offline. Your records stay on this device.';
    } catch {
      offlineStatus.textContent = 'Offline setup is unavailable. You can still play while connected.';
    }
  });
} else {
  offlineStatus.textContent = 'This browser does not support offline setup. Open Grid Rush in Chrome, Edge, or Safari.';
}
