// オフライン用の保存（ずかんの え は いちど ひらいた ときに ほぞん される）。ファイルを増やしたら FILES に足して VERSION を上げる
const VERSION = 'v17';
const FILES = [
  './', 'index.html', 'style.css', 'manifest.webmanifest',
  'js/app.js', 'js/store.js', 'js/sound.js', 'js/data.js',
  'js/games/hiragana.js', 'js/games/count.js', 'js/games/numberline.js',
  'js/games/maze.js', 'js/games/pattern.js', 'js/games/oddone.js', 'js/games/puzzle.js', 'js/games/words.js', 'js/games/reading.js', 'js/games/whatisit.js', 'js/zukan.js',
  'img/bg.svg',
  'img/mascot.png', 'img/robots/car.png', 'img/robots/fire.png', 'img/robots/police.png', 'img/robots/ambulance.png', 'img/robots/bus.png', 'img/robots/tractor.png', 'img/robots/truck.png', 'img/robots/train.png', 'img/robots/shinkansen.png', 'img/robots/plane.png', 'img/robots/heli.png', 'img/robots/ship.png', 'img/robots/rocket.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

// ずかんの え（80まい）は ひとつ しっぱい しても いんすとーる を とめない
const ZUKAN = ["img/zukan/%E3%81%82%E3%81%B2%E3%82%8B.png", "img/zukan/%E3%81%84%E3%81%8B.png", "img/zukan/%E3%81%84%E3%81%A1%E3%81%94.png", "img/zukan/%E3%81%84%E3%81%AC.png", "img/zukan/%E3%81%86%E3%81%95%E3%81%8E.png", "img/zukan/%E3%81%86%E3%81%97.png", "img/zukan/%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A.png", "img/zukan/%E3%81%8B%E3%81%88%E3%82%8B.png", "img/zukan/%E3%81%8B%E3%81%95.png", "img/zukan/%E3%81%8B%E3%81%AB.png", "img/zukan/%E3%81%8B%E3%81%B6%E3%81%A8%E3%82%80%E3%81%97.png", "img/zukan/%E3%81%8B%E3%81%BC%E3%81%A1%E3%82%83.png", "img/zukan/%E3%81%8B%E3%82%81.png", "img/zukan/%E3%81%8B%E3%82%8C%E3%83%BC.png", "img/zukan/%E3%81%8D%E3%81%A3%E3%81%B7.png", "img/zukan/%E3%81%8D%E3%82%85%E3%81%86%E3%81%8D%E3%82%85%E3%81%86%E3%81%97%E3%82%83.png", "img/zukan/%E3%81%8D%E3%82%85%E3%81%86%E3%82%8A.png", "img/zukan/%E3%81%8D%E3%82%8A%E3%82%93.png", "img/zukan/%E3%81%8F%E3%81%98%E3%82%89.png", "img/zukan/%E3%81%8F%E3%81%A4.png", "img/zukan/%E3%81%8F%E3%81%BE.png", "img/zukan/%E3%81%8F%E3%82%8B%E3%81%BE.png", "img/zukan/%E3%81%91%E3%83%BC%E3%81%8D.png", "img/zukan/%E3%81%93%E3%81%82%E3%82%89.png", "img/zukan/%E3%81%93%E3%81%A3%E3%81%B7.png", "img/zukan/%E3%81%94%E3%82%8A%E3%82%89.png", "img/zukan/%E3%81%95%E3%81%8B%E3%81%AA.png", "img/zukan/%E3%81%95%E3%82%8B.png", "img/zukan/%E3%81%97%E3%82%83%E3%81%B9%E3%82%8B%E3%81%8B%E3%83%BC.png", "img/zukan/%E3%81%97%E3%82%87%E3%81%86%E3%81%BC%E3%81%86%E3%81%97%E3%82%83.png", "img/zukan/%E3%81%97%E3%82%93%E3%81%8B%E3%82%93%E3%81%9B%E3%82%93.png", "img/zukan/%E3%81%98%E3%81%A6%E3%82%93%E3%81%97%E3%82%83.png", "img/zukan/%E3%81%99%E3%81%84%E3%81%8B.png", "img/zukan/%E3%81%9B%E3%81%BF.png", "img/zukan/%E3%81%9E%E3%81%86.png", "img/zukan/%E3%81%9F%E3%81%93.png", "img/zukan/%E3%81%9F%E3%81%AC%E3%81%8D.png", "img/zukan/%E3%81%A0%E3%81%84%E3%81%93%E3%82%93.png", "img/zukan/%E3%81%A0%E3%82%93%E3%81%94.png", "img/zukan/%E3%81%A1%E3%82%87%E3%81%86.png", "img/zukan/%E3%81%A6%E3%82%93%E3%81%A8%E3%81%86%E3%82%80%E3%81%97.png", "img/zukan/%E3%81%A7%E3%82%93%E3%81%97%E3%82%83.png", "img/zukan/%E3%81%A8%E3%81%86%E3%82%82%E3%82%8D%E3%81%93%E3%81%97.png", "img/zukan/%E3%81%A8%E3%81%91%E3%81%84.png", "img/zukan/%E3%81%A8%E3%81%BE%E3%81%A8.png", "img/zukan/%E3%81%A8%E3%82%89%E3%81%8F%E3%81%9F%E3%83%BC.png", "img/zukan/%E3%81%A8%E3%82%89%E3%81%A3%E3%81%8F.png", "img/zukan/%E3%81%A8%E3%82%93%E3%81%BC.png", "img/zukan/%E3%81%AA%E3%81%97.png", "img/zukan/%E3%81%AA%E3%81%99.png", "img/zukan/%E3%81%AB%E3%82%93%E3%81%98%E3%82%93.png", "img/zukan/%E3%81%AD%E3%81%93.png", "img/zukan/%E3%81%AF%E3%81%A1.png", "img/zukan/%E3%81%B0%E3%81%99.png", "img/zukan/%E3%81%B0%E3%81%A3%E3%81%9F.png", "img/zukan/%E3%81%B0%E3%81%AA%E3%81%AA.png", "img/zukan/%E3%81%B1%E3%81%A8%E3%81%8B%E3%83%BC.png", "img/zukan/%E3%81%B1%E3%82%93.png", "img/zukan/%E3%81%B1%E3%82%93%E3%81%A0.png", "img/zukan/%E3%81%B2%E3%81%93%E3%81%86%E3%81%8D.png", "img/zukan/%E3%81%B2%E3%82%88%E3%81%93.png", "img/zukan/%E3%81%B5%E3%81%86%E3%81%9B%E3%82%93.png", "img/zukan/%E3%81%B5%E3%81%AD.png", "img/zukan/%E3%81%B6%E3%81%9F.png", "img/zukan/%E3%81%B6%E3%81%A9%E3%81%86.png", "img/zukan/%E3%81%B6%E3%82%8D%E3%81%A3%E3%81%93%E3%82%8A%E3%83%BC.png", "img/zukan/%E3%81%B8%E3%82%8A%E3%81%93%E3%81%B7%E3%81%9F%E3%83%BC.png", "img/zukan/%E3%81%BA%E3%82%93%E3%81%8E%E3%82%93.png", "img/zukan/%E3%81%BB%E3%81%86%E3%81%8D.png", "img/zukan/%E3%81%BC%E3%81%86%E3%81%97.png", "img/zukan/%E3%81%BF%E3%81%8B%E3%82%93.png", "img/zukan/%E3%82%81%E3%81%8C%E3%81%AD.png", "img/zukan/%E3%82%82%E3%82%82.png", "img/zukan/%E3%82%88%E3%81%A3%E3%81%A8.png", "img/zukan/%E3%82%89%E3%81%84%E3%81%8A%E3%82%93.png", "img/zukan/%E3%82%89%E3%81%A3%E3%81%93.png", "img/zukan/%E3%82%89%E3%81%A3%E3%81%B1.png", "img/zukan/%E3%82%89%E3%83%BC%E3%82%81%E3%82%93.png", "img/zukan/%E3%82%8A%E3%82%93%E3%81%94.png", "img/zukan/%E3%82%8D%E3%81%91%E3%81%A3%E3%81%A8.png"];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(FILES).then(() => Promise.allSettled(ZUKAN.map((u) => c.add(u)))))
      .then(() => self.skipWaiting())
  );
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
