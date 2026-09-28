// ことばを つくろう: えを みて、もじの たいるを じゅんばんに たっぷして ことばを つくる
// だくおん・のばす おと・ちいさい じ（っ ゃ ゅ ょ）の れんしゅう
import { pic as zpic } from '../zukan.js';

const LEVELS = [
  { name: '2もじ', n: 1, words: [['いぬ', '🐶'], ['ねこ', '🐱'], ['かさ', '☂️'], ['かに', '🦀'], ['はな', '🌸'], ['くつ', '👟'], ['いか', '🦑'], ['かめ', '🐢'], ['うし', '🐮'], ['さる', '🐵'], ['くま', '🐻'], ['もも', '🍑'], ['なす', '🍆'], ['ほし', '⭐'], ['たこ', '🐙'], ['なし', '🍐'], ['はち', '🐝'], ['せみ', '🪲']] },
  { name: '3もじ', n: 2, words: [['さかな', '🐟'], ['くるま', '🚗'], ['すいか', '🍉'], ['きりん', '🦒'], ['ひよこ', '🐤'], ['とまと', '🍅'], ['あひる', '🦆'], ['こあら', '🐨'], ['たぬき', '🦝'], ['かえる', '🐸'], ['ふね', '🚢'], ['みかん', '🍊']] },
  { name: 'てんてん・まる', n: 2, words: [['ぶどう', '🍇'], ['ばなな', '🍌'], ['ぱんだ', '🐼'], ['ごりら', '🦍'], ['りんご', '🍎'], ['いちご', '🍓'], ['たまご', '🥚'], ['めがね', '👓'], ['ぞう', '🐘'], ['ぺんぎん', '🐧'], ['ばす', '🚌'], ['でんわ', '☎️'], ['だんご', '🍡'], ['とんぼ', '🪰'], ['かぶとむし', '🪲'], ['だいこん', '🥕'], ['ぶた', '🐷'], ['うさぎ', '🐰'], ['にんじん', '🥕'], ['くじら', '🐋']] },
  { name: 'のばす おと', n: 2, words: [['けーき', '🍰'], ['ぼーる', '⚽'], ['らーめん', '🍜'], ['かれー', '🍛'], ['ぼうし', '🧢'], ['とけい', '⏰'], ['ひこうき', '✈️'], ['ふうせん', '🎈'], ['ほうき', '🧹'], ['こおり', '🧊'], ['とうもろこし', '🌽']] },
  { name: 'ちいさい っ', n: 2, words: [['らっぱ', '🎺'], ['ろけっと', '🚀'], ['よっと', '⛵'], ['こっぷ', '🥛'], ['きっぷ', '🎫'], ['ばった', '🦗'], ['らっこ', '🦦'], ['はっぱ', '🍃']] },
  { name: 'ちいさい ゃゅょ', n: 3, words: [['でんしゃ', '🚃'], ['きしゃ', '🚂'], ['ちょう', '🦋'], ['きゅうり', '🥒'], ['じてんしゃ', '🚲'], ['しゃつ', '👕'], ['おちゃ', '🍵'], ['しょうぼうしゃ', '🚒'], ['きゅうきゅうしゃ', '🚑'], ['かぼちゃ', '🎃'], ['しゃべるかー', '🚜']] },
];

// まちがえやすい もじ（ちいさい⇔おおきい、てんてん⇔なし、のばし⇔う）
const CONFUSE = {
  っ: 'つ', つ: 'っ', ゃ: 'や', や: 'ゃ', ゅ: 'ゆ', ゆ: 'ゅ', ょ: 'よ', よ: 'ょ', ー: 'う', う: 'ー',
  が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ', ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ',
  だ: 'た', で: 'て', ど: 'と', ば: 'ぱ', び: 'ぴ', ぶ: 'ぷ', べ: 'ぺ', ぼ: 'ぽ', ぱ: 'ば', ぴ: 'び', ぷ: 'ぶ', ぺ: 'べ', ぽ: 'ぼ',
  か: 'が', き: 'ぎ', く: 'ぐ', こ: 'ご', さ: 'ざ', し: 'じ', た: 'だ', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', ほ: 'ぼ',
};
const FILLER = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわん'.split('');
const SMALL = new Set(['っ', 'ゃ', 'ゅ', 'ょ']);

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
  id: 'words',
  title: 'ことばを つくろう',
  icon: '🔤',
  color: '#ffa94d',
  howto: 'えの なまえを もじで つくってね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 4 ? 0 : age === 5 ? 1 : age === 6 ? 2 : 3),

  question(level) {
    const L = LEVELS[level];
    let w;
    do w = pick(L.words); while (w[0] === last && L.words.length > 1);
    last = w[0];
    const [word, pic] = w;
    const chars = [...word];

    // たいる = ことばの もじ ＋ まちがえやすい もじ
    const extra = [];
    for (const c of shuffle([...new Set(chars)])) {
      const d = CONFUSE[c];
      if (d && !chars.includes(d) && !extra.includes(d) && extra.length < L.n) extra.push(d);
    }
    while (extra.length < L.n) {
      const f = pick(FILLER);
      if (!chars.includes(f) && !extra.includes(f)) extra.push(f);
    }
    const tiles = shuffle([...chars, ...extra]);

    return {
      key: word,
      render(root, api) {
        root.innerHTML = `
          <div class="wd-top">
            <button class="replay" aria-label="もういちど きく">🔊</button>
            <div class="wd-pic">${zpic(word, pic)}</div>
          </div>
          <div class="wd-slots">${chars.map(() => '<span class="wd-slot"></span>').join('')}</div>
          <div class="wd-tiles">${tiles.map((c, i) => `<button class="choice wd-tile ${SMALL.has(c) ? 'small' : ''}" data-i="${i}" data-c="${c}">${c}</button>`).join('')}</div>`;
        const say = (rate) => api.speak(word, { rate });
        const ask = () => say(0.7);
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        const slots = [...root.querySelectorAll('.wd-slot')];
        let pos = 0;
        let first = true;
        root.querySelectorAll('.wd-tile').forEach((b) => {
          b.onclick = async () => {
            if (b.disabled || pos >= chars.length) return;
            if (b.dataset.c === chars[pos]) {
              const slot = slots[pos++];
              slot.textContent = b.dataset.c;
              slot.classList.add('filled');
              if (SMALL.has(b.dataset.c)) slot.classList.add('small');
              b.disabled = true;
              b.classList.add('used');
              api.tap();
              if (pos === chars.length) {
                api.correct(root.querySelector('.wd-slots'));
                await say(0.85);
                api.done(first);
              } else {
                slots[pos].classList.add('next');
                slots[pos - 1].classList.remove('next');
              }
            } else {
              // ちがう たいるは おかない。ゆっくり いいなおして きづかせる
              first = false;
              api.wrong(b);
              setTimeout(() => { b.disabled = false; b.classList.remove('ng'); }, 700);
              await api.speak(`${word.slice(0, pos)}`.length ? `${word}。 ${word.slice(0, pos)}の つぎは？` : `${word}。 さいしょの もじは？`, { rate: 0.7 });
            }
          };
        });
        slots[0].classList.add('next');
        ask();
      },
    };
  },
};
