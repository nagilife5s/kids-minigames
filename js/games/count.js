// かず「のりものを かぞえて タッチ」
import { ROAD_PICS } from '../data.js';
import { pic } from '../zukan.js';

const LEVELS = [
  { min: 1, max: 3, n: 2 },
  { min: 1, max: 5, n: 3 },
  { min: 1, max: 10, n: 3 },
  { min: 5, max: 10, n: 4 },
  { min: 8, max: 15, n: 4 },
  { min: 10, max: 20, n: 4 },
];

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

let last = null;

export default {
  id: 'count',
  title: 'のりものを かぞえよう',
  icon: '🔢',
  color: '#74c0fc',
  howto: 'のりものを タッチして かぞえてね',
  levels: LEVELS.length,
  maxLevel: (age) => (age <= 3 ? 2 : LEVELS.length - 1), // 3さいは 10まで
  startLevel: (age) => (age <= 3 ? 1 : age <= 5 ? 2 : age === 6 ? 3 : 4),

  question(level) {
    const L = LEVELS[level];
    let ans;
    do ans = rand(L.min, L.max); while (ans === last && L.max > L.min);
    last = ans;
    const icon = pic(ROAD_PICS[rand(0, ROAD_PICS.length - 1)]);

    // 近い数をまぎらわしい選択肢にする
    const choices = new Set([ans]);
    for (let d = 1; choices.size < L.n; d++) {
      for (const c of Math.random() < 0.5 ? [ans - d, ans + d] : [ans + d, ans - d]) {
        if (c >= 1 && choices.size < L.n) choices.add(c);
      }
    }
    const sorted = [...choices].sort((a, b) => a - b);

    return {
      key: String(ans),
      render(root, api) {
        const ask = () => api.speak('いくつ あるかな？');
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="field ${ans > 10 ? 'many' : ''}">
            ${Array.from({ length: Math.ceil(ans / 5) }, (_, g) => `<div class="group">${
              Array.from({ length: Math.min(5, ans - g * 5) }, () => `<button class="thing">${icon}</button>`).join('')}</div>`).join('')}
          </div>
          <div class="choices nums n${L.n}">
            ${sorted.map((c) => `<button class="choice" data-c="${c}">${api.noText && c <= 10 ? `<span class="dotnum">${'●'.repeat(c)}</span>` : ''}${c}</button>`).join('')}
          </div>`;
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        let counted = 0;
        root.querySelectorAll('.thing').forEach((t) => {
          t.onclick = () => {
            if (t.dataset.n) { api.speak(t.dataset.n); return; }
            t.dataset.n = String(++counted);
            t.classList.add('counted');
            api.tap();
            api.speak(String(counted));
          };
        });

        let first = true;
        root.querySelectorAll('.choice').forEach((b) => {
          b.onclick = async () => {
            if (Number(b.dataset.c) === ans) {
              api.correct(b);
              await api.speak(`${ans}だい！`);
              api.done(first);
            } else {
              first = false;
              // かぞえた しるしを けして、さいしょから かぞえなおす
              counted = 0;
              root.querySelectorAll('.thing').forEach((t) => { delete t.dataset.n; t.classList.remove('counted'); });
              api.wrong(b);
              await api.speak('もういちど かぞえてみよう');
            }
          };
        });
        ask();
      },
    };
  },
};
