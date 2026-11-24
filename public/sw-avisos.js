// Al tocar un aviso de mantenimiento se abre (o enfoca) la app.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((L) => {
    for (const c of L) if ("focus" in c) { c.focus(); return; }
    return clients.openWindow(url);
  }));
});
