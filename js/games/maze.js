// めいろで ごーる: のりものを ゆびで なぞって、みちを とおって いきさきへ
// みちの とちゅうの ほしも ひろえる。ごーるに つくと のりものが ろぼに へんしん
import { pic } from '../zukan.js';

// のりものと いきさき
const TRIPS = [
  { rider: '🚒', goal: '🔥', name: 'しょうぼうしゃ', robot: 'fire', place: 'かじの ばしょ' },
  { rider: '🚑', goal: '🏥', name: 'きゅうきゅうしゃ', robot: 'ambulance', place: 'びょういん' },
  { rider: '🚓', goal: '🏢', name: 'ぱとかー', robot: 'police', place: 'けいさつしょ' },
  { rider: '🚌', goal: '🚏', name: 'ばす', robot: 'bus', place: 'ばすてい' },
  { rider: '🚚', goal: '📦', name: 'とらっく', robot: 'truck', place: 'にもつの ところ' },
  { rider: '🚜', goal: '🌾', name: 'とらくたー', robot: 'tractor', place: 'はたけ' },
  { rider: '🚗', goal: '🏠', name: 'くるま', robot: 'car', place: 'おうち' },
];

// rows は みじかい ほうの マスの かず。ながい ほうは がめんの たてよこ ひに あわせて きめる（がめん いっぱいに ひろげる）
// branch: わかれみちの おおさ（0 = ながい 1ぽんみち ぎみ、1 = わかれみち だらけ）
// braid: いきどまりを へらす わりあい（ちいさい こ むけ）
const LEVELS = [
  { rows: 3, braid: 0.6, branch: 0.2, stars: 1 },
  { rows: 3, braid: 0.4, branch: 0.3, stars: 2 },
  { rows: 4, braid: 0.3, branch: 0.4, stars: 2 },
  { rows: 5, braid: 0.15, branch: 0.5, stars: 3 },
  { rows: 6, braid: 0.05, branch: 0.35, stars: 3 },
  { rows: 7, braid: 0, branch: 0.35, stars: 3 },
  { rows: 8, braid: 0, branch: 0.35, stars: 3 },
  // ここから かぎ 🔑: みちから はずれた いきどまりの かぎを とらないと ごーるに はいれない
  { rows: 8, braid: 0, branch: 0.35, stars: 3, key: true },
  { rows: 9, braid: 0, branch: 0.35, stars: 3, key: true },
  { rows: 10, braid: 0, branch: 0.35, stars: 3, key: true },
  { rows: 11, braid: 0, branch: 0.35, stars: 3, key: true },
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// あなほり法で めいろ → いくつか かべを こわして いきどまりを へらす
function generate(W, H, braid, keep = () => false, branch = 0) {
  const link = new Set(); // "x,y|nx,ny" どうしが つながって いる
  const key = (a, b, c, d) => (a < c || (a === c && b < d) ? `${a},${b}|${c},${d}` : `${c},${d}|${a},${b}`);
  const seen = Array.from({ length: H }, () => Array(W).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    // あたらしい ますから のばすと ながい みち、らんだむな ますから のばすと わかれみち に なる
    const idx = Math.random() < branch ? Math.floor(Math.random() * stack.length) : stack.length - 1;
    const [x, y] = stack[idx];
    const next = DIRS.map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx]);
    if (!next.length) { stack.splice(idx, 1); continue; }
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
  startLevel: (age) => (age <= 3 ? 0 : age === 4 ? 2 : age === 5 ? 4 : age === 6 ? 6 : 7),

  question(level) {
    const L = LEVELS[level];
    // がめんの あいて いる ばしょの たてよこ ひに あわせて ますの かずを きめる
    const aspect = Math.max(0.5, Math.min(2.2, (innerWidth - 24) / (innerHeight - 88)));
    const portrait = aspect < 1;
    const W = portrait ? L.rows : Math.max(L.rows + 1, Math.round(L.rows * aspect));
    const H = portrait ? Math.max(L.rows + 1, Math.round(L.rows / aspect)) : L.rows;
    // ゴールがわの はしは いきどまりを のこす（みちの おわりに ゴールを おくため）
    const onGoalEdge = (x, y) => (portrait ? y === H - 1 : x === W - 1);
    const trip = pick(TRIPS);

    // めいろを いくつか つくって「せいかいの みちが ながく、とちゅうの わかれみちが おおい」ものを えらぶ
    const build = () => {
      const m = generate(W, H, L.braid, onGoalEdge, L.branch);
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
      const path = [[gx, gy]];
      while (path[0][0] || path[0][1]) {
        const [x, y] = path[0];
        const back = DIRS.map(([dx, dy]) => [x + dx, y + dy])
          .find(([nx, ny]) => m.inside(nx, ny) && m.open(x, y, nx, ny) && dist[ny][nx] === dist[y][x] - 1);
        path.unshift(back);
      }
      const forks = path.filter(([x, y]) => m.degree(x, y) >= 3).length;
      return { m, dist, gx, gy, path, score: path.length + forks * 3 };
    };
    const tries = level >= 5 ? 15 : 1;
    let pickd = build();
    for (let t = 1; t < tries; t++) { const c = build(); if (c.score > pickd.score) pickd = c; }
    const { m, dist, gx, gy, path } = pickd;
    let best = dist[gy][gx];

    // かぎ: ごーるまでの みちから いちばん はなれた いきどまり
    let key = null;
    if (L.key) {
      const onPath = new Set(path.map(([x, y]) => `${x},${y}`));
      const far = Array.from({ length: H }, () => Array(W).fill(-1));
      const q = path.map(([x, y]) => { far[y][x] = 0; return [x, y]; });
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy;
          if (!m.inside(nx, ny) || far[ny][nx] >= 0 || !m.open(x, y, nx, ny)) continue;
          far[ny][nx] = far[y][x] + 1;
          q.push([nx, ny]);
        }
      }
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (onPath.has(`${x},${y}`) || m.degree(x, y) !== 1) continue;
          if (!key || far[y][x] > far[key[1]][key[0]]) key = [x, y];
        }
      }
      if (key) best = dist[key[1]][key[0]] + distances(m, W, H, key[0], key[1])[gy][gx];
    }
    const stars = [];
    for (let i = 1; i <= L.stars; i++) {
      const at = path[Math.round((i * (path.length - 1)) / (L.stars + 1))];
      if (at && !(at[0] === gx && at[1] === gy) && (at[0] || at[1])) stars.push(`${at[0]},${at[1]}`);
    }

    return {
      key: `maze${level}`,
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
            <div class="spot goal ${key ? 'locked' : ''}" style="--x:${gx};--y:${gy}">${trip.goal}${key ? '<span class="lock">🔒</span>' : ''}</div>
            ${key ? `<div class="spot key" style="--x:${key[0]};--y:${key[1]}">🔑</div>` : ''}
            ${stars.map((s) => { const [x, y] = s.split(','); return `<div class="spot star" data-s="${s}" style="--x:${x};--y:${y}">⭐</div>`; }).join('')}
            <div class="spot rider" style="--x:0;--y:0">${pic(trip.name, trip.rider)}</div>
          </div>`;
        const ask = () => api.speak(key
          ? `${trip.place}には かぎが かかって いるよ。 さきに かぎを とってから いこう`
          : `${trip.name}を ${trip.place}まで つれていってね`);
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        const board = root.querySelector('.maze');
        const riderEl = board.querySelector('.rider');
        const trailEl = board.querySelector('.trail');
        const countEl = root.querySelector('.star-count b');
        const route = [[0, 0]]; // いま とおって いる みち（もどると けす）
        let moves = 0, got = 0, finished = false, hasKey = !key, warned = false;

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
            api.speak('ほし みっけ！', { rate: 1.1 });
          }
          if (!hasKey && nx === key[0] && ny === key[1]) {
            hasKey = true;
            board.querySelector('.key').classList.add('got');
            board.querySelector('.goal').classList.remove('locked');
            api.speak('かぎを とった！ ごーるの かぎが あいたよ');
          }
          if (nx === gx && ny === gy && !hasKey) {
            if (!warned) { warned = true; api.speak('かぎが かかってるよ。 かぎを さがそう'); }
            board.querySelector('.goal').classList.remove('shake'); void board.offsetWidth;
            board.querySelector('.goal').classList.add('shake');
            return true;
          }
          if (nx === gx && ny === gy) {
            finished = true;
            api.correct(board.querySelector('.goal'));
            // ろぼに へんしん！
            riderEl.innerHTML = `<img class="zk" src="img/robots/${trip.robot}.png" alt="" draggable="false">`;
            riderEl.classList.add('transform');
            const msg = got === stars.length ? 'ほしも ぜんぶ ひろえたね！' : got ? `ほしを ${got}こ ひろえたね` : '';
            api.speak(`${trip.place}に ついた！ ろぼに へんしん！ ${msg}`).then(() => api.done(moves <= Math.ceil(best * 1.6) + 2));
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
