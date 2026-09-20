import { API_URL, apiFetch } from '../api/client';

// Converts the URL-safe base64 VAPID public key into the Uint8Array shape
// the PushManager API expects.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function enablePushNotifications() {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const { publicKey } = await fetch(`${API_URL}/notifications/vapid-public-key`).then((r) => r.json());
  if (!publicKey) {
    throw new Error('Server has no VAPID key configured — push is disabled server-side');
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  await apiFetch('/notifications/subscribe', {
    method: 'POST',
    body: { endpoint: json.endpoint, keys: json.keys, userAgent: navigator.userAgent },
  });

  return subscription;
}

export async function disablePushNotifications() {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  await apiFetch('/notifications/subscribe', {
    method: 'DELETE',
    body: { endpoint: subscription.endpoint },
  });
  await subscription.unsubscribe();
}
