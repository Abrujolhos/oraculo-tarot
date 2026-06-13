// v3 — cache mínimo, sempre rede primeiro. Resolve versões presas em cache.
const CACHE = "oraculo-v3";

self.addEventListener("install", () => {
  self.skipWaiting(); // ativa imediatamente a nova versão
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Network-first sempre. Nunca servir HTML/API de cache.
  // Só usa cache como último recurso se a rede falhar (offline real).
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase.co")) return; // API nunca passa pelo SW
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
