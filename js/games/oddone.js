// なかまはずれは どれ？
const CATS = {
  road: { name: 'みちを はしる のりもの', items: ['🚗', '🚌', '🚓', '🚑', '🚒', '🚚', '🚜'] },
  sky: { name: 'そらを とぶ もの', items: ['✈️', '🚁', '🚀', '🎈', '🪂'] },
  sea: { name: 'みずの うえを すすむ のりもの', items: ['🚢', '⛵', '🚤', '🛶', '⛴️'] },
  fruit: { name: 'くだもの', items: ['🍎', '🍌', '🍇', '🍊', '🍑', '🍐'] },
  veg: { name: 'やさい', items: ['🥕', '🥦', '🌽', '🥒', '🍆'] },
  animal: { name: 'どうぶつ', items: ['🐶', '🐱', '🐰', '🐻', '🐼', '🦁', '🐘'] },
};
// にている なかま（むずかしい もんだい用）
const NEAR = [['road', 'sky', 'sea'], ['fruit', 'veg']];

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
      const g = pick(NEAR);
      [main, odd] = shuffle([...g]);
    } else {
      const keys = Object.keys(CATS);
      main = pick(keys);
      const far = keys.filter((k) => k !== main && !NEAR.some((g) => g.includes(k) && g.includes(main)));
      odd = pick(far);
    }
    const oddItem = pick(CATS[odd].items);
    const items = shuffle([...shuffle([...CATS[main].items]).slice(0, L.n - 1), oddItem]);

    return {
      key: `${main}/${odd}`,
      render(root, api) {
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="choices emo n${L.n}">
            ${items.map((c) => `<button class="choice" data-c="${c}">${c}</button>`).join('')}
          </div>`;
        const ask = () => api.speak('なかまはずれは どれかな？');
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };
        let first = true;
        root.querySelectorAll('.choice').forEach((b) => {
          b.onclick = async () => {
            if (b.dataset.c === oddItem) {
              api.correct(b);
              await api.speak(`あたり！ ほかは みんな ${CATS[main].name} だね`);
              api.done(first);
            } else {
              first = false;
              api.wrong(b);
              await api.speak('それは なかまだよ');
            }
          };
        });
        ask();
      },
    };
  },
};
