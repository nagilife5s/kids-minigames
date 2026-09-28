// これ なあに？（ずかんの え）
// きいて えらぶ → かげ あて → なまえを よむ
import { CATS, ALL, pic, catOf } from '../zukan.js';

const LEVELS = [
  { mode: 'listen', n: 2 },
  { mode: 'listen', n: 3 },
  { mode: 'shadow', n: 3 },
  { mode: 'read', n: 3 },
  { mode: 'shadow', n: 4, same: true },
  { mode: 'read', n: 4, same: true },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

let last = null;

export default {
  id: 'what',
  title: 'これ なあに？',
  icon: '🔍',
  color: '#99e9f2',
  howto: 'えを よく みて こたえてね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age <= 5 ? 2 : 3),

  question(level, stats) {
    const L = LEVELS[level];
    let target;
    const cands = L.same ? ALL.filter((x) => CATS[catOf(x)].items.length >= 4) : ALL;
    do target = pick(cands); while (target === last);
    last = target;
    // むずかしい ときは おなじ なかまから まぎらわしい ものを えらぶ
    const pool = L.same ? CATS[catOf(target)].items : ALL;
    const others = shuffle(pool.filter((x) => x !== target));
    const extra = shuffle(ALL.filter((x) => x !== target && !others.includes(x)));
    const choices = shuffle([target, ...[...others, ...extra].slice(0, L.n - 1)]);

    return {
      key: `${L.mode}:${target}`,
      render(root, api) {
        // 3さいは もじを よめないので「なまえを よむ」は かげ あてに する
        const mode = api.noText && L.mode === 'read' ? 'shadow' : L.mode;
        let ask;
        if (mode === 'listen') {
          root.innerHTML = `
            <button class="replay" aria-label="もういちど きく">🔊</button>
            <div class="choices pics n${L.n}">${choices.map((c) => `<button class="choice" data-c="${c}">${pic(c)}</button>`).join('')}</div>`;
          ask = () => api.speak(`${target} は どれかな？`);
        } else if (mode === 'shadow') {
          root.innerHTML = `
            <button class="replay" aria-label="もういちど きく">🔊</button>
            <div class="wi-big shadow">${pic(target)}</div>
            <div class="choices pics small n${L.n}">${choices.map((c) => `<button class="choice" data-c="${c}">${pic(c)}</button>`).join('')}</div>`;
          ask = () => api.speak('この かげは だれかな？');
        } else {
          root.innerHTML = `
            <button class="replay" aria-label="もういちど きく">🔊</button>
            <div class="wi-big">${pic(target)}</div>
            <div class="choices names n${L.n}">${choices.map((c) => `<button class="choice" data-c="${c}">${c}</button>`).join('')}</div>`;
          ask = () => api.speak('これ なあに？ なまえを よんで えらんでね');
        }
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        let first = true;
        root.querySelectorAll('.choice').forEach((b) => {
          b.onclick = async () => {
            if (b.dataset.c === target) {
              api.correct(b);
              root.querySelector('.wi-big')?.classList.remove('shadow');
              await api.speak(`${target}！`);
              api.done(first);
            } else {
              first = false;
              api.wrong(b);
              await api.speak(mode === 'read' ? `それは ${b.dataset.c} って よむよ` : `それは ${b.dataset.c} だよ`);
            }
          };
        });
        ask();
      },
    };
  },
};
