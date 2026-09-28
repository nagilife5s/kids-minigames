// なかまはずれは どれ？（ずかんの え）
import { CATS, pic } from '../zukan.js';

// はっきり ちがう なかま（やさしい もんだい用）
const EASY = ['animal', 'fruit', 'veg', 'sea', 'bug', 'food', 'tool', 'road'];
// にている なかま（むずかしい もんだい用）
const NEAR = [['fruit', 'veg'], ['sea', 'bug'], ['road', 'sky'], ['road', 'rail'], ['food', 'fruit']];

const LEVELS = [
  { n: 3, near: false },
  { n: 4, near: false },
  { n: 4, near: true },
  { n: 5, near: true },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const nearOf = (a, b) => NEAR.some((g) => g.includes(a) && g.includes(b));

export default {
  id: 'odd',
  title: 'なかまはずれは どれ？',
  icon: '🧐',
  color: '#63e6be',
  howto: 'ひとつだけ なかまじゃない ものが あるよ。みつけて タッチしてね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age <= 5 ? 1 : age === 6 ? 2 : 3),

  question(level) {
    const L = LEVELS[level];
    let main, odd;
    if (L.near) {
      // なかまの かずが たりる ほうを 「なかま」に する
      const g = shuffle([...pick(NEAR)]);
      [main, odd] = CATS[g[0]].items.length >= L.n - 1 ? g : [g[1], g[0]];
    } else {
      main = pick(EASY);
      odd = pick(EASY.filter((k) => k !== main && !nearOf(k, main)));
    }
    const oddItem = pick(CATS[odd].items.filter((x) => !CATS[main].items.includes(x)));
    const mates = shuffle(CATS[main].items.filter((x) => !CATS[odd].items.includes(x))).slice(0, L.n - 1);
    const items = shuffle([...mates, oddItem]);

    return {
      key: `${main}/${odd}`,
      render(root, api) {
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="choices emo pics n${L.n}">
            ${items.map((c) => `<button class="choice" data-c="${c}">${pic(c)}</button>`).join('')}
          </div>`;
        const ask = () => api.speak('なかまはずれは どれかな？');
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };
        let first = true;
        root.querySelectorAll('.choice').forEach((b) => {
          b.onclick = async () => {
            if (b.dataset.c === oddItem) {
              api.correct(b);
              await api.speak(`あたり！ ${oddItem} だけ ちがうね。 ほかは みんな ${CATS[main].name} だね`);
              api.done(first);
            } else {
              first = false;
              api.wrong(b);
              await api.speak(`${b.dataset.c} は なかまだよ`);
            }
          };
        });
        ask();
      },
    };
  },
};
