// つぎは どれ？（ならびかたの きまりを みつける）
import { VEHICLES } from '../data.js';

const SETS = [
  ['🔴', '🔵', '🟡', '🟢', '🟣'],
  ['🍎', '🍌', '🍇', '🍓', '🍊'],
  VEHICLES,
  ['⭐', '❤️', '🔷', '🌙', '🍀'],
];

const LEVELS = [
  { types: ['AB'], n: 2 },
  { types: ['AB', 'AAB'], n: 3 },
  { types: ['AAB', 'ABB', 'ABC'], n: 3 },
  { types: ['ABC', 'AABB', 'ABB'], n: 4 },
  { types: ['ABCD', 'AABC', 'ABAC'], n: 4 },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export default {
  id: 'pattern',
  title: 'つぎは どれ？',
  icon: '🔁',
  color: '#b197fc',
  howto: 'ならびかたの きまりを みつけて、はてなに はいる ものを えらんでね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age <= 5 ? 1 : age === 6 ? 2 : 3),

  question(level) {
    const L = LEVELS[level];
    const type = pick(L.types);
    const letters = [...new Set(type)];
    const set = shuffle([...pick(SETS)]);
    const map = Object.fromEntries(letters.map((c, i) => [c, set[i]]));
    const unit = [...type].map((c) => map[c]);

    // 2しゅう ＋ すこし みせて、つぎの 1こを きく
    const shown = unit.length * 2 + Math.floor(Math.random() * unit.length);
    const seq = Array.from({ length: shown }, (_, i) => unit[i % unit.length]);
    const answer = unit[shown % unit.length];

    const choices = new Set([answer]);
    for (const x of shuffle([...new Set(unit)])) if (choices.size < L.n) choices.add(x);
    for (const x of set) if (choices.size < L.n) choices.add(x);

    return {
      key: type,
      render(root, api) {
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="seq ${shown > 8 ? 'long' : ''}">
            ${seq.map((s) => `<span class="item">${s}</span>`).join('')}<span class="item q">？</span>
          </div>
          <div class="choices emo n${L.n}">
            ${shuffle([...choices]).map((c) => `<button class="choice" data-c="${c}">${c}</button>`).join('')}
          </div>`;
        const ask = () => api.speak('つぎは どれかな？');
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };
        let first = true;
        root.querySelectorAll('.choice').forEach((b) => {
          b.onclick = async () => {
            if (b.dataset.c === answer) {
              api.correct(b);
              const q = root.querySelector('.item.q');
              q.textContent = answer;
              q.classList.remove('q');
              q.classList.add('filled');
              await api.speak('あたり！');
              api.done(first);
            } else {
              first = false;
              api.wrong(b);
              const items = [...root.querySelectorAll('.item')].slice(0, unit.length);
              api.speak('ここを みてね。 おなじ ならびが くりかえして いるよ');
              for (const it of items) { it.classList.add('hint'); await new Promise((r) => setTimeout(r, 450)); }
              setTimeout(() => items.forEach((it) => it.classList.remove('hint')), 900);
            }
          };
        });
        ask();
      },
    };
  },
};
