// «Их мастерууд» service worker — офлайн дэмжлэг.
//
// Гараар бичсэн (Serwist/next-pwa биш): Next 16-д Turbopack нь анхдагч bundler
// бөгөөд эдгээр plugin-ууд webpack config шаарддаг тул build-ийг унагадаг.
// Next-ийн албан ёсны PWA заавар ч гараар бичихийг зөвлөдөг.

const VERSION = "v1";
const SHELL_CACHE = `art-shell-${VERSION}`;
const STATIC_CACHE = `art-static-${VERSION}`;
const IMAGE_CACHE = `art-images-${VERSION}`;
const OFFLINE_CACHE = `art-offline-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE, OFFLINE_CACHE];

const OFFLINE_URL = "/offline";
const SHELL_URLS = ["/", OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png"];

// Бүтээлийн бүх зураг эндээс ирдэг. `commons.wikimedia.org` нь
// `upload.wikimedia.org` руу 302 үсэргэдэг тул хоёуланг нь тооцно.
const MEDIA_HOSTS = new Set(["commons.wikimedia.org", "upload.wikimedia.org"]);

// Автоматаар кэшлэгдэх зургийн дээд тоо. Хэрэглэгчийн зориуд татсан зургууд
// OFFLINE_CACHE-д ордог тул энэ хязгаарт хамаарахгүй.
const IMAGE_CACHE_MAX_ENTRIES = 200;

/**
 * Cross-origin зургууд `crossOrigin` атрибутгүй тул no-cors горимд татагдаж,
 * хариу нь opaque (status === 0) ирнэ. `response.ok` шалгавал БҮГД хаягдаж,
 * офлайнд нэг ч зураг харагдахгүй болно.
 */
function isCacheable(response) {
  return Boolean(response) && (response.ok || response.type === "opaque");
}

const isMediaHost = (url) => MEDIA_HOSTS.has(url.hostname);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // Нэг URL амжилтгүй болоод бүх install унахаас сэргийлж тус тусад нь
      .then((cache) => Promise.allSettled(SHELL_URLS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  // Cache API нь оруулсан дарааллаа хадгалдаг — хамгийн хуучныг эхэнд нь хасна
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

// ─────────────────── Хүсэлтийн стратегиуд ───────────────────

// Навигаци: сүлжээг эхэнд, амжилтгүй бол кэшнээс (яг хуудас → эс бөгөөс /offline)
async function handleNavigate(request) {
  const shell = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) shell.put(request, response.clone());
    return response;
  } catch {
    // Хэрэглэгчийн зориуд татсан хуудсууд тусдаа кэшэнд байдаг
    const offline = await caches.open(OFFLINE_CACHE);
    return (
      (await shell.match(request)) ||
      (await offline.match(request)) ||
      (await shell.match(OFFLINE_URL)) ||
      new Response("Сүлжээгүй байна.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

// /_next/static/**: хэш агуулсан, өөрчлөгддөггүй → cache-first
async function handleStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) cache.put(request, response.clone());
  return response;
}

// Бүтээлийн зургууд: эхлээд аль ч кэшнээс, зэрэг сүлжээнээс шинэчилнэ
async function handleImage(request) {
  // Зориуд татсан зургууд эхний ээлжинд — офлайнд баталгаатай ажиллана
  const offline = await caches.open(OFFLINE_CACHE);
  const saved = await offline.match(request);
  if (saved) return saved;

  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) {
        cache.put(request, response.clone()).then(() => {
          trimCache(IMAGE_CACHE, IMAGE_CACHE_MAX_ENTRIES);
        });
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Мутациуд (POST/PUT/DELETE) — огт хөндөхгүй
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  // Гадаад: зөвхөн Wikimedia-гийн зургууд
  if (url.origin !== self.location.origin) {
    if (isMediaHost(url)) event.respondWith(handleImage(request));
    return;
  }

  // ── Эндээс доош: same-origin ──

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleStatic(request));
    return;
  }

  if (
    request.destination === "image" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(handleStatic(request));
  }
});

// ─────────────── Хэрэглэгчийн зориуд татах ───────────────

/**
 * URL-уудыг OFFLINE_CACHE-д хийж, явцыг илгээгч client рүү мэдээлнэ.
 * Энэ кэш trim хийгддэггүй — хэрэглэгч өөрөө сонгож татсан зүйл автомат
 * цэвэрлэгээнд устах ёсгүй.
 */
async function cacheUrls(urls, source) {
  const cache = await caches.open(OFFLINE_CACHE);
  let done = 0;
  let failed = 0;

  const report = () => source?.postMessage({ type: "CACHE_PROGRESS", done, failed, total: urls.length });

  // Зэрэг 6-аар — Wikimedia-г дарамтлахгүй, гэхдээ хангалттай хурдан
  const CONCURRENCY = 6;
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    await Promise.all(
      urls.slice(i, i + CONCURRENCY).map(async (url) => {
        try {
          // Cross-origin зургийг no-cors-оор татна — opaque хариу ч кэшлэгдэнэ
          const isExternal = !url.startsWith("/") && !url.startsWith(self.location.origin);
          const response = await fetch(url, isExternal ? { mode: "no-cors" } : undefined);
          if (isCacheable(response)) {
            await cache.put(url, response);
            done++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }),
    );
    report();
  }

  source?.postMessage({ type: "CACHE_DONE", done, failed, total: urls.length });
}

async function clearOffline(source) {
  await caches.delete(OFFLINE_CACHE);
  source?.postMessage({ type: "CACHE_CLEARED" });
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (data?.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(cacheUrls(data.urls, event.source));
    return;
  }
  if (data?.type === "CLEAR_OFFLINE") {
    event.waitUntil(clearOffline(event.source));
  }
});
