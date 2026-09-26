// めいろ: のりものを ゆびで なぞって ゴールまで はこぶ
import { VEHICLES } from '../data.js';

const SIZES = [3, 4, 5, 6, 7, 8];

// あなほり法で めいろを つくる（wallR: 右のかべ, wallB: 下のかべ）
function generate(n) {
  const wallR = Array.from({ length: n }, () => Array(n).fill(true));
  const wallB = Array.from({ length: n }, () => Array(n).fill(true));
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const next = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny][nx]);
    if (!next.length) { stack.pop(); continue; }
    const [nx, ny] = next[Math.floor(Math.random() * next.length)];
    if (nx > x) wallR[y][x] = false;
    if (nx < x) wallR[y][nx] = false;
    if (ny > y) wallB[y][x] = false;
    if (ny < y) wallB[ny][x] = false;
    seen[ny][nx] = true;
    stack.push([nx, ny]);
  }
  return { wallR, wallB };
}

function open(m, x, y, nx, ny) {
  if (nx === x + 1 && ny === y) return !m.wallR[y][x];
  if (nx === x - 1 && ny === y) return !m.wallR[y][nx];
  if (ny === y + 1 && nx === x) return !m.wallB[y][x];
  if (ny === y - 1 && nx === x) return !m.wallB[ny][x];
  return false;
}

function shortest(m, n) {
  const dist = Array.from({ length: n }, () => Array(n).fill(-1));
  const q = [[0, 0]];
  dist[0][0] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= n || ny >= n || dist[ny][nx] >= 0 || !open(m, x, y, nx, ny)) continue;
      dist[ny][nx] = dist[y][x] + 1;
      q.push([nx, ny]);
    }
  }
  return dist[n - 1][n - 1];
}

export default {
  id: 'maze',
  title: 'めいろで ごーる',
  icon: '🏁',
  color: '#ffc078',
  howto: 'のりものを ゆびで なぞって、ごーるの はたまで つれていってね',
  levels: SIZES.length,
  startLevel: (age) => (age <= 3 ? 0 : age === 4 ? 1 : age === 5 ? 2 : age === 6 ? 3 : 4),

  question(level) {
    const n = SIZES[level];
    const m = generate(n);
    const best = shortest(m, n);
    const rider = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];

    return {
      key: `${n}x${n}`,
      render(root, api) {
        const cells = [];
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const cls = [m.wallR[y][x] ? 'wr' : '', m.wallB[y][x] ? 'wb' : ''].join(' ');
            cells.push(`<div class="cell ${cls}" data-x="${x}" data-y="${y}">${x === n - 1 && y === n - 1 ? '<span class="goal">🏁</span>' : ''}</div>`);
          }
        }
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="maze" style="--n:${n}">${cells.join('')}<div class="rider">${rider}</div></div>`;
        const ask = () => api.speak('ごーるまで いけるかな？');
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        const board = root.querySelector('.maze');
        const riderEl = board.querySelector('.rider');
        const cellAt = (x, y) => board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        let px = 0, py = 0, moves = 0, finished = false;
        const place = () => { riderEl.style.setProperty('--x', px); riderEl.style.setProperty('--y', py); };
        cellAt(0, 0).classList.add('trail');
        place();

        const tryMove = (nx, ny) => {
          if (finished || !open(m, px, py, nx, ny)) return;
          px = nx; py = ny; moves++;
          cellAt(px, py).classList.add('trail');
          place();
          api.tap();
          if (px === n - 1 && py === n - 1) {
            finished = true;
            api.correct(cellAt(px, py));
            api.speak('ごーる！').then(() => api.done(moves <= Math.ceil(best * 1.5)));
          }
        };

        // ゆびの した の マスへ、となり なら すすむ（とびこしは 1マスずつ たどる）
        const follow = (e) => {
          const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.cell');
          if (!el || !board.contains(el)) return;
          const tx = Number(el.dataset.x), ty = Number(el.dataset.y);
          for (let guard = 0; guard < 2 * n && (tx !== px || ty !== py); guard++) {
            const sx = px + Math.sign(tx - px), sy = py + Math.sign(ty - py);
            const bx = px, by = py;
            if (tx !== px && open(m, px, py, sx, py)) tryMove(sx, py);
            else if (ty !== py && open(m, px, py, px, sy)) tryMove(px, sy);
            if (bx === px && by === py) break;
          }
        };
        let dragging = false;
        board.addEventListener('pointerdown', (e) => { dragging = true; board.setPointerCapture?.(e.pointerId); follow(e); });
        board.addEventListener('pointermove', (e) => { if (dragging) follow(e); });
        board.addEventListener('pointerup', () => { dragging = false; });
        board.addEventListener('pointercancel', () => { dragging = false; });
        ask();
      },
    };
  },
};
