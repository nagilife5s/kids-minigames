// ぶんしょうを よもう: 3ぶん くらいの ぶんしょうを こえに だして よむ。おうちの ひとが ⭕／❌ を つける
// れべるは こどもが えらぶ（てんてん・のばす おと・ちいさい じ が あるか ないか）

export const READING_LEVELS = [
  {
    name: 'せいおん', note: 'てんてん・のばす おと・ちいさい じ なし', color: '#8ce99a',
    texts: [
      ['🐶', 'いぬ は しろい。', 'いぬ は はしる。', 'いぬ は かわいい。'],
      ['🐱', 'ねこ は ねむい。', 'ねこ は まるく なる。', 'おやすみ ねこ。'],
      ['🍑', 'もも を かう。', 'もも は あまい。', 'おいしい もも。'],
      ['🐟', 'さかな は うみ に いる。', 'さかな は はやい。', 'すいすい すすむ。'],
      ['🌸', 'はな を みる。', 'あかい はな。', 'きいろい はな も ある。'],
      ['🐢', 'かめ は のろのろ あるく。', 'かめ は いけ に はいる。', 'かめ の せなか は かたい。'],
      ['🌙', 'よる に なる。', 'そら に つき。', 'ほし も ひかる。'],
      ['🚗', 'くるま に のる。', 'まち へ いく。', 'おみせ に つく。'],
      ['🍉', 'なつ は あつい。', 'すいか を きる。', 'あかくて あまい。'],
      ['🐻', 'くま は もり に すむ。', 'くま は はちみつ を なめる。', 'おいしい な。'],
    ],
  },
  {
    name: 'てんてん・まる', note: 'が・ば・ぱ などが でてくる', color: '#74c0fc',
    texts: [
      ['🦒', 'きりん は くび が ながい。', 'たかい ところ に とどく。', 'すごい ね。'],
      ['🐼', 'ぱんだ が ささ を たべる。', 'ぱんだ は しろ と くろ。', 'ごろごろ ねる。'],
      ['🍌', 'さる が ばなな を みつけた。', 'ぱくぱく たべる。', 'おなか が ふくれた。'],
      ['🚌', 'ばす に のる。', 'えき まで いく。', 'ばす は おおきい。'],
      ['☔', 'あめ が ふる。', 'かさ を さす。', 'ながぐつ で あるく。'],
      ['🐸', 'かえる が いけ で なく。', 'げろげろ げろげろ。', 'あめ が すき。'],
      ['🐷', 'ぶた が どろ で あそぶ。', 'ぶた は どろんこ。', 'おふろ に はいる。'],
      ['🦍', 'ごりら は つよい。', 'むね を どんどん たたく。', 'でも やさしい。'],
      ['🍃', 'かぜ が ふく。', 'き が ゆれる。', 'そら に くも が ながれる。'],
      ['🦀', 'かに が すな を あるく。', 'よこ に あるく。', 'はさみ を あげる。'],
    ],
  },
  {
    name: 'のばす おと', note: 'けーき・ひこうき の ように のばす', color: '#ffc078',
    texts: [
      ['🍰', 'けーき を たべる。', 'いちご が ある。', 'おいしい けーき。'],
      ['⚽', 'ぼーる を ける。', 'ころころ ころがる。', 'ごーる に はいる。'],
      ['✈️', 'ひこうき が とぶ。', 'そら は ひろい。', 'とおく へ いく。'],
      ['🍜', 'らーめん は あつい。', 'ふーふー する。', 'つるつる たべる。'],
      ['🐘', 'ぞう の はな は ながい。', 'みず を あびる。', 'ぞう は おおきい。'],
      ['🏊', 'ぷーる で およぐ。', 'みず は つめたい。', 'せんせい と あそぶ。'],
      ['🧢', 'ぼうし を かぶる。', 'こうえん に いく。', 'すべりだい で あそぶ。'],
      ['🍛', 'かれー を つくる。', 'にんじん を きる。', 'おかあさん と つくる。'],
      ['🦁', 'らいおん は どうぶつ の おう。', 'がおー と ほえる。', 'みんな おどろく。'],
      ['🚓', 'ぱとかー が とおる。', 'うー うー と なる。', 'まち を まもる。'],
    ],
  },
  {
    name: 'ちいさい じ', note: 'っ・ゃ・ゅ・ょ が でてくる', color: '#b197fc',
    texts: [
      ['🚃', 'でんしゃ に のる。', 'がたんごとん。', 'きっぷ を もって いる。'],
      ['🦋', 'ちょうちょ が とぶ。', 'はな に とまる。', 'ひらひら きれい。'],
      ['🥒', 'きゅうり を かじる。', 'ぱりっ と なる。', 'しゃきしゃき おいしい。'],
      ['🚀', 'ろけっと が とぶ。', 'ぐんぐん のぼる。', 'うちゅう へ しゅっぱつ。'],
      ['🐕', 'こいぬ が しっぽ を ふる。', 'いっしょ に さんぽ。', 'たのしい ね。'],
      ['🍵', 'おちゃ を のむ。', 'ちょっと あつい。', 'ふうふう さます。'],
      ['🚲', 'じてんしゃ に のる。', 'ちゃんと まえ を みる。', 'しゅっぱつ しんこう。'],
      ['🎺', 'らっぱ を ふく。', 'ぷっぷー と なる。', 'みんな が あつまる。'],
      ['🚒', 'しょうぼうしゃ が はしる。', 'きゅうきゅうしゃ も はしる。', 'まち を まもって いる。'],
      ['🐈', 'ねこ が じゃんぷ した。', 'たかい たな に のった。', 'すごい じゃんぷ。'],
    ],
  },
];

// まだ ⭕ に なって いない ぶんしょうを じゅんばんに だす
function nextIndex(texts, stats, lvl, last) {
  const done = (i) => (stats[`${lvl}-${i}`]?.ok || 0) > 0;
  const i = texts.findIndex((_, k) => !done(k) && k !== last);
  if (i >= 0) return i;
  const all = texts.map((_, k) => k).filter((k) => k !== last);
  return all[Math.floor(Math.random() * all.length)];
}

let last = null;

export default {
  id: 'reading',
  title: 'ぶんしょうを よもう',
  icon: '📖',
  color: '#ffd43b',
  howto: 'ぶんしょうを こえに だして よんでね。おうちの ひとが まるを つけるよ',
  levels: READING_LEVELS.length,
  startLevel: () => 0,
  perRound: 3,
  manualLevel: true, // れべるは こどもが えらぶ
  levelChoices: READING_LEVELS,
  progress: (stats, lvl) => READING_LEVELS[lvl].texts.filter((_, i) => (stats[`${lvl}-${i}`]?.ok || 0) > 0).length,

  question(level, stats) {
    const L = READING_LEVELS[level];
    const i = nextIndex(L.texts, stats, level, last);
    last = i;
    const [pic, ...lines] = L.texts[i];

    return {
      key: `${level}-${i}`,
      render(root, api) {
        root.innerHTML = `
          <div class="rd">
            <div class="rd-pic">${pic}</div>
            <div class="rd-text">${lines.map((l) => `<p>${l.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ')}</p>`).join('')}</div>
          </div>
          <div class="rd-parent">
            <span class="rd-label">おうちの ひと</span>
            <button class="rd-ng">❌ <small>もういちど</small></button>
            <button class="rd-ok">⭕ <small>よめた</small></button>
          </div>`;
        const ok = root.querySelector('.rd-ok');
        const ng = root.querySelector('.rd-ng');
        let first = true;
        ok.onclick = async () => {
          api.correct(root.querySelector('.rd-text'));
          ok.disabled = ng.disabled = true;
          await api.speak(first ? 'じょうずに よめたね！' : 'さいごまで よめたね！');
          api.done(first);
        };
        ng.onclick = async () => {
          first = false;
          ok.disabled = ng.disabled = true;
          // おてほんを ゆっくり よむ。よんで いる ぶんを ひからせる
          await api.speak('いっしょに よんで みよう');
          const ps = [...root.querySelectorAll('.rd-text p')];
          for (const p of ps) {
            p.classList.add('reading');
            await api.speak(p.textContent, { rate: 0.7 });
            p.classList.remove('reading');
          }
          await api.speak('こんどは ひとりで よんで みてね');
          ok.disabled = ng.disabled = false;
        };
      },
    };
  },
};
