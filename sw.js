// オフライン用の保存。ファイルを増やしたら FILES に足して VERSION を上げる
const VERSION = 'v13';
const FILES = [
  './', 'index.html', 'style.css', 'manifest.webmanifest',
  'js/app.js', 'js/store.js', 'js/sound.js', 'js/data.js',
  'js/games/hiragana.js', 'js/games/count.js', 'js/games/numberline.js',
  'js/games/maze.js', 'js/games/pattern.js', 'js/games/oddone.js', 'js/games/puzzle.js', 'js/games/words.js',
  'img/bg.svg',
  'img/mascot.png', 'img/robots/car.png', 'img/robots/fire.png', 'img/robots/police.png', 'img/robots/ambulance.png', 'img/robots/bus.png', 'img/robots/tractor.png', 'img/robots/truck.png', 'img/robots/train.png', 'img/robots/shinkansen.png', 'img/robots/plane.png', 'img/robots/heli.png', 'img/robots/ship.png', 'img/robots/rocket.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // ネットにつながるときは最新を取りに行き、つながらないときだけ保存分を使う
  // 電波が よわくて 返事が こない ときは 3びょうで 保存分に きりかえる
  const net = fetch(e.request, { cache: 'no-cache' }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return res;
  });
  const cached = () => caches.match(e.request, { ignoreSearch: true });
  const slow = new Promise((resolve) => setTimeout(resolve, 3000)).then(cached);
  e.respondWith(
    Promise.race([net.catch(cached), slow.then((hit) => hit || net)])
      .then((res) => res || net)
      .catch(() => cached())
  );
});
