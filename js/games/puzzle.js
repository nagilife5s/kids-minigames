// ぱずる: かたちはめ（●■▲ を おなじ かたちの あなへ）→ のりものの じぐそー
import { VEHICLES } from '../data.js';

const SHAPES = [
  { id: 'circle', name: 'まる', color: '#ff6b6b' },
  { id: 'square', name: 'しかく', color: '#4dabf7' },
  { id: 'triangle', name: 'さんかく', color: '#ffd43b' },
  { id: 'star', name: 'ほし', color: '#b197fc' },
  { id: 'heart', name: 'はーと', color: '#f783ac' },
  { id: 'diamond', name: 'ひしがた', color: '#69db7c' },
];

const LEVELS = [
  { kind: 'shape', n: 2 },
  { kind: 'shape', n: 3 },
  { kind: 'shape', n: 4 },
  { kind: 'jigsaw', cols: 2, rows: 2, guide: true },
  { kind: 'jigsaw', cols: 3, rows: 3, guide: true },
  { kind: 'jigsaw', cols: 3, rows: 3, guide: false },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default {
  id: 'puzzle',
  title: 'ぱずるを はめよう',
  icon: '🧩',
  color: '#ffa8a8',
  howto: 'ぴーすを ゆびで うごかして、ぴったりの ところに はめてね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age === 4 ? 1 : age === 5 ? 2 : age === 6 ? 3 : 4),

  question(level) {
    const L = LEVELS[level];
    const pic = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
    const shapes = shuffle([...SHAPES]).slice(0, L.n || 0);

    return {
      key: L.kind === 'shape' ? `shape${L.n}` : `${L.cols}x${L.rows}`,
      render(root, api) {
        // あな（slot）と ぴーす（piece）を つくる。data-id が おなじ ものが せいかい
        let slots, pieces, board;
        if (L.kind === 'shape') {
          board = `<div class="pz-holes">${shuffle([...shapes]).map((s) =>
            `<div class="slot hole" data-id="${s.id}"><span class="shp ${s.id}"></span></div>`).join('')}</div>`;
          pieces = shapes.map((s) => `<div class="piece" data-id="${s.id}"><span class="shp ${s.id}" style="--c:${s.color}"></span></div>`);
        } else {
          const { cols, rows } = L;
          const cells = [];
          for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push([x, y]);
          const tile = ([x, y]) => `<span class="jig-img" style="--x:${x};--y:${y}">${pic}</span>`;
          board = `<div class="pz-frame" style="--cols:${cols};--rows:${rows}">
            ${L.guide ? `<div class="jig-guide">${pic}</div>` : ''}
            ${cells.map(([x, y]) => `<div class="slot cell" data-id="${x}-${y}"></div>`).join('')}</div>`;
          pieces = cells.map((c) => `<div class="piece jig" data-id="${c[0]}-${c[1]}" style="--cols:${cols};--rows:${rows}">${tile(c)}</div>`);
        }
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="pz ${L.kind}">
            ${board}
            <div class="pz-tray">${shuffle(pieces).join('')}</div>
          </div>`;

        const ask = () => api.speak(L.kind === 'shape' ? 'おなじ かたちの あなに はめてね' : 'えが できるように ならべてね');
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        slots = [...root.querySelectorAll('.slot')];
        let left = slots.length;
        let first = true;

        root.querySelectorAll('.piece').forEach((p) => {
          let sx = 0, sy = 0, dragging = false;
          p.addEventListener('pointerdown', (e) => {
            if (p.classList.contains('placed')) return;
            dragging = true;
            p.setPointerCapture?.(e.pointerId);
            sx = e.clientX; sy = e.clientY;
            p.classList.add('drag');
            api.tap();
          });
          p.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            p.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.08)`;
          });
          const drop = (e) => {
            if (!dragging) return;
            dragging = false;
            p.classList.remove('drag');
            // ゆびを はなした ところに いちばん ちかい あなを さがす
            const hit = slots.find((s) => {
              const r = s.getBoundingClientRect();
              return !s.classList.contains('filled') && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            });
            p.style.transform = '';
            if (!hit) return;
            if (hit.dataset.id === p.dataset.id) {
              hit.classList.add('filled');
              p.classList.add('placed');
              hit.appendChild(p);
              api.tap();
              if (L.kind === 'shape') api.speak(SHAPES.find((s) => s.id === p.dataset.id).name, { rate: 1 });
              if (--left === 0) {
                api.correct(root.querySelector('.pz'));
                api.speak('できた！').then(() => api.done(first));
              }
            } else {
              first = false;
              api.wrong(document.createElement('i')); // えんしゅつだけ（ぴーすは つかえるまま）
              hit.classList.add('shake');
              setTimeout(() => hit.classList.remove('shake'), 400);
            }
          };
          p.addEventListener('pointerup', drop);
          p.addEventListener('pointercancel', drop);
        });
        ask();
      },
    };
  },
};
