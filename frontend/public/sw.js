// Runs in its own worker context (no access to the page's DOM/React state).
// Kept deliberately minimal: display the notification the server sent, and
// focus/open the app when it's clicked. This is what lets reminders arrive
// even when the tab or the whole browser window is closed, as long as the
// browser process is running and the OS delivers the push.

self.addEventListener('push', (event) => {
  let data = { title: 'Todo reminder', body: 'You have a task due.' };
  try {
    if (event.data) data = event.data.json();
  } catch {
    // Non-JSON payload — fall back to the default text above.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((client) => client.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(targetUrl);
        return undefined;
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
