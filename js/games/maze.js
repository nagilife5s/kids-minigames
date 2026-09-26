// めいろで ごーる: のりものを ゆびで なぞって、みちを とおって いきさきへ
// みちの とちゅうの ほしも ひろえる

// のりものと いきさき
const TRIPS = [
  { rider: '🚒', goal: '🔥', name: 'しょうぼうしゃ', place: 'かじの ばしょ' },
  { rider: '🚑', goal: '🏥', name: 'きゅうきゅうしゃ', place: 'びょういん' },
  { rider: '🚓', goal: '🏢', name: 'ぱとかー', place: 'けいさつしょ' },
  { rider: '🚌', goal: '🚏', name: 'ばす', place: 'ばすてい' },
  { rider: '🚚', goal: '📦', name: 'とらっく', place: 'にもつの ところ' },
  { rider: '🚜', goal: '🌾', name: 'とらくたー', place: 'はたけ' },
  { rider: '🚗', goal: '🏠', name: 'くるま', place: 'おうち' },
];

// cols×rows（よこながの iPad むけ）。braid は いきどまりを へらす わりあい（ちいさい こ むけ）
const LEVELS = [
  { cols: 4, rows: 3, braid: 0.6, stars: 1 },
  { cols: 5, rows: 3, braid: 0.4, stars: 2 },
  { cols: 6, rows: 4, braid: 0.3, stars: 2 },
  { cols: 7, rows: 5, braid: 0.15, stars: 3 },
  { cols: 9, rows: 6, braid: 0.05, stars: 3 },
  { cols: 11, rows: 7, braid: 0, stars: 3 },
  { cols: 13, rows: 8, braid: 0, stars: 3 },
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// あなほり法で めいろ → いくつか かべを こわして いきどまりを へらす
function generate(W, H, braid, keep = () => false) {
  const link = new Set(); // "x,y|nx,ny" どうしが つながって いる
  const key = (a, b, c, d) => (a < c || (a === c && b < d) ? `${a},${b}|${c},${d}` : `${c},${d}|${a},${b}`);
  const seen = Array.from({ length: H }, () => Array(W).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const next = DIRS.map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx]);
    if (!next.length) { stack.pop(); continue; }
    const [nx, ny] = pick(next);
    link.add(key(x, y, nx, ny));
    seen[ny][nx] = true;
    stack.push([nx, ny]);
  }
  const open = (x, y, nx, ny) => link.has(key(x, y, nx, ny));
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const degree = (x, y) => DIRS.filter(([dx, dy]) => inside(x + dx, y + dy) && open(x, y, x + dx, y + dy)).length;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (keep(x, y) || degree(x, y) !== 1 || Math.random() >= braid) continue;
      const opts = DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([nx, ny]) => inside(nx, ny) && !open(x, y, nx, ny));
      if (opts.length) { const [nx, ny] = pick(opts); link.add(key(x, y, nx, ny)); }
    }
  }
  return { open, inside, degree, link };
}

function distances(m, W, H, sx, sy) {
  const dist = Array.from({ length: H }, () => Array(W).fill(-1));
  const q = [[sx, sy]];
  dist[sy][sx] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!m.inside(nx, ny) || dist[ny][nx] >= 0 || !m.open(x, y, nx, ny)) continue;
      dist[ny][nx] = dist[y][x] + 1;
      q.push([nx, ny]);
    }
  }
  return dist;
}

export default {
  id: 'maze',
  title: 'めいろで ごーる',
  icon: '🏁',
  color: '#ffc078',
  howto: 'のりものを ゆびで なぞって、みちを とおって いきさきまで つれていってね。ほしも ひろえるかな？',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age === 4 ? 1 : age === 5 ? 2 : age === 6 ? 3 : 4),

  question(level) {
    const L = LEVELS[level];
    // たてながで もって いたら たて・よこを いれかえる
    const portrait = innerHeight > innerWidth;
    const W = portrait ? L.rows : L.cols;
    const H = portrait ? L.cols : L.rows;
    // ゴールがわの はしは いきどまりを のこす（みちの おわりに ゴールを おくため）
    const onGoalEdge = (x, y) => (portrait ? y === H - 1 : x === W - 1);
    const m = generate(W, H, L.braid, onGoalEdge);
    const trip = pick(TRIPS);

    // スタートは ひだりうえ。ゴールは はんたいがわの はしの「みちの おわり（いきどまり）」の うち、いちばん とおい マス
    const dist = distances(m, W, H, 0, 0);
    let gx = -1, gy = -1;
    for (const deadEndOnly of [true, false]) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (!onGoalEdge(x, y) || (deadEndOnly && m.degree(x, y) !== 1)) continue;
          if (gx < 0 || dist[y][x] > dist[gy][gx]) { gx = x; gy = y; }
        }
      }
      if (gx >= 0) break;
    }
    const best = dist[gy][gx];

    // ほしは ゴールまでの みちの うえに ならべる（もどらずに ひろえる）
    const path = [[gx, gy]];
    while (path[0][0] || path[0][1]) {
      const [x, y] = path[0];
      const back = DIRS.map(([dx, dy]) => [x + dx, y + dy])
        .find(([nx, ny]) => m.inside(nx, ny) && m.open(x, y, nx, ny) && dist[ny][nx] === dist[y][x] - 1);
      path.unshift(back);
    }
    const stars = [];
    for (let i = 1; i <= L.stars; i++) {
      const at = path[Math.round((i * (path.length - 1)) / (L.stars + 1))];
      if (at && !(at[0] === gx && at[1] === gy) && (at[0] || at[1])) stars.push(`${at[0]},${at[1]}`);
    }

    return {
      key: `${L.cols}x${L.rows}`,
      render(root, api) {
        const S = 100; // 1マスの おおきさ（SVG の たんい）
        const c = (v) => v * S + S / 2;
        const roads = [...m.link].map((k) => {
          const [[x1, y1], [x2, y2]] = k.split('|').map((p) => p.split(',').map(Number));
          return `M${c(x1)} ${c(y1)}L${c(x2)} ${c(y2)}`;
        }).join('');
        const trees = [];
        for (let y = 1; y < H; y++) for (let x = 1; x < W; x++) if (Math.random() < 0.3) trees.push(`<text x="${x * S}" y="${y * S + 9}" class="tree">${pick(['🌳', '🌲', '🌷', '🌼'])}</text>`);

        root.innerHTML = `
          <div class="maze-top">
            <button class="replay" aria-label="もういちど きく">🔊</button>
            <span class="star-count">⭐ <b>0</b> / ${stars.length}</span>
          </div>
          <div class="maze" style="--w:${W};--h:${H}">
            <svg viewBox="0 0 ${W * S} ${H * S}" aria-hidden="true">
              <rect width="${W * S}" height="${H * S}" rx="24" class="grass"/>
              <path d="${roads}" class="road"/>
              <path d="${roads}" class="road-line"/>
              <path d="" class="trail"/>
              ${trees.join('')}
              <circle cx="${c(0)}" cy="${c(0)}" r="30" class="start"/>
            </svg>
            <div class="spot goal" style="--x:${gx};--y:${gy}">${trip.goal}</div>
            ${stars.map((s) => { const [x, y] = s.split(','); return `<div class="spot star" data-s="${s}" style="--x:${x};--y:${y}">⭐</div>`; }).join('')}
            <div class="spot rider" style="--x:0;--y:0">${trip.rider}</div>
          </div>`;
        const ask = () => api.speak(`${trip.name}を ${trip.place}まで つれていってね`);
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        const board = root.querySelector('.maze');
        const riderEl = board.querySelector('.rider');
        const trailEl = board.querySelector('.trail');
        const countEl = root.querySelector('.star-count b');
        const route = [[0, 0]]; // いま とおって いる みち（もどると けす）
        let moves = 0, got = 0, finished = false;

        const draw = () => {
          const [x, y] = route[route.length - 1];
          riderEl.style.setProperty('--x', x);
          riderEl.style.setProperty('--y', y);
          trailEl.setAttribute('d', route.map(([rx, ry], i) => `${i ? 'L' : 'M'}${c(rx)} ${c(ry)}`).join(''));
        };

        const step = (nx, ny) => {
          const [x, y] = route[route.length - 1];
          if (finished || !m.inside(nx, ny) || !m.open(x, y, nx, ny)) return false;
          const prev = route[route.length - 2];
          if (prev && prev[0] === nx && prev[1] === ny) route.pop(); else route.push([nx, ny]);
          moves++;
          draw();
          api.tap();
          const star = board.querySelector(`.star[data-s="${nx},${ny}"]:not(.got)`);
          if (star) {
            star.classList.add('got');
            countEl.textContent = ++got;
            api.speak('ほし げっと！', { rate: 1.1 });
          }
          if (nx === gx && ny === gy) {
            finished = true;
            api.correct(board.querySelector('.goal'));
            const msg = got === stars.length ? 'ほしも ぜんぶ ひろえたね！' : got ? `ほしを ${got}こ ひろえたね` : '';
            api.speak(`${trip.place}に ついた！ ${msg}`).then(() => api.done(moves <= Math.ceil(best * 1.6) + 2));
          }
          return true;
        };

        // ゆびの いる マスへ むかって、みちが あれば 1マスずつ すすむ
        const follow = (e) => {
          const r = board.getBoundingClientRect();
          const tx = Math.floor(((e.clientX - r.left) / r.width) * W);
          const ty = Math.floor(((e.clientY - r.top) / r.height) * H);
          if (!m.inside(tx, ty)) return;
          for (let guard = 0; guard < W + H; guard++) {
            const [x, y] = route[route.length - 1];
            if (x === tx && y === ty) break;
            const sx = x + Math.sign(tx - x), sy = y + Math.sign(ty - y);
            const moved = (tx !== x && step(sx, y)) || (ty !== y && step(x, sy));
            if (!moved) break;
          }
        };
        let dragging = false;
        board.addEventListener('pointerdown', (e) => { dragging = true; board.setPointerCapture?.(e.pointerId); follow(e); });
        board.addEventListener('pointermove', (e) => { if (dragging) follow(e); });
        board.addEventListener('pointerup', () => { dragging = false; });
        board.addEventListener('pointercancel', () => { dragging = false; });
        draw();
        ask();
      },
    };
  },
};
