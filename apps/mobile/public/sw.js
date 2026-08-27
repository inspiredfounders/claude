// Inspired Club Service Worker — handles push notifications

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: "Inspired Club", body: event.data.text() }; }

  const options = {
    body:    data.body ?? "",
    icon:    "/icon-192.png",
    badge:   "/badge-72.png",
    tag:     "inspired-daily",
    renotify: true,
    vibrate: [200, 100, 200],
    data:    { url: data.url ?? "/" },
    actions: [
      { action: "open",    title: "Open the app" },
      { action: "dismiss", title: "Dismiss"       },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Inspired Club", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
