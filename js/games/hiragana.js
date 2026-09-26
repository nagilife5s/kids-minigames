// ひらがな「おとを きいて もじを えらぶ」
// 読み上げで区別できない字（を＝お、ぢ＝じ、づ＝ず）は出さない
const SEION = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわん'.split('');
const DAKU = 'がぎぐげござじずぜぞだでどばびぶべぼぱぴぷぺぽ'.split('');

// 形が似ていて取りちがえやすい組
const LOOKALIKE = [
  'ぬめ', 'われね', 'るろ', 'はほけ', 'さきち', 'いり', 'こに', 'あおめ', 'まも', 'くへ', 'たな', 'しつ', 'うら',
];
// 濁音・半濁音は元の字と組にする（か↔が、は↔ば↔ぱ）
const BASE = { が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ', ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ', だ: 'た', で: 'て', ど: 'と', ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ', ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ' };

const LEVELS = [
  { pool: SEION.slice(0, 10), n: 2 },
  { pool: SEION.slice(0, 20), n: 3 },
  { pool: SEION, n: 3 },
  { pool: SEION, n: 4, tricky: true },
  { pool: [...SEION, ...DAKU], n: 4, tricky: true },
  { pool: DAKU, n: 4, tricky: true },
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function similar(ch) {
  const out = new Set();
  for (const g of LOOKALIKE) if (g.includes(ch)) for (const c of g) out.add(c);
  const base = BASE[ch];
  if (base) {
    out.add(base);
    for (const [d, b] of Object.entries(BASE)) if (b === base) out.add(d);
  }
  for (const [d, b] of Object.entries(BASE)) if (b === ch) out.add(d);
  out.delete(ch);
  return [...out];
}

// まちがえた字ほど出やすくする
function pickTarget(pool, stats, last) {
  const w = pool.map((c) => {
    if (c === last) return 0;
    const s = stats[c];
    return s ? 1 + (3 * (s.n - s.ok)) / s.n : 1.5;
  });
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= w[i]) <= 0) return pool[i];
  return pool[0];
}

// まちがえた ときの ヒント（「あひるの あ」）
const HINT = {
  あ: 'あひる', い: 'いぬ', う: 'うさぎ', え: 'えんぴつ', お: 'おに', か: 'かさ', き: 'きりん', く: 'くるま', け: 'けむし', こ: 'こま',
  さ: 'さかな', し: 'しか', す: 'すいか', せ: 'せみ', そ: 'そら', た: 'たいこ', ち: 'ちょう', つ: 'つみき', て: 'てがみ', と: 'とけい',
  な: 'なす', に: 'にんじん', ぬ: 'ぬいぐるみ', ね: 'ねこ', の: 'のり', は: 'はな', ひ: 'ひこうき', ふ: 'ふね', へ: 'へび', ほ: 'ほし',
  ま: 'まくら', み: 'みかん', む: 'むし', め: 'めがね', も: 'もも', や: 'やま', ゆ: 'ゆき', よ: 'よっと', ら: 'らっぱ', り: 'りんご',
  る: 'るすばん', れ: 'れもん', ろ: 'ろけっと', わ: 'わに', ん: 'ぱん',
  が: 'がっこう', ぎ: 'ぎゅうにゅう', ぐ: 'ぐんて', げ: 'げた', ご: 'ごりら', ざ: 'ざりがに', じ: 'じてんしゃ', ず: 'ずぼん', ぜ: 'ぜりー', ぞ: 'ぞう',
  だ: 'だんご', で: 'でんしゃ', ど: 'どんぐり', ば: 'ばなな', び: 'びすけっと', ぶ: 'ぶどう', べ: 'べんとう', ぼ: 'ぼうし',
  ぱ: 'ぱんだ', ぴ: 'ぴあの', ぷ: 'ぷりん', ぺ: 'ぺんぎん', ぽ: 'ぽすと',
};
// 「ん」は ことばの あたまに こないので「ぱんの ん」と いう
const hintText = (c) => (HINT[c] ? `${HINT[c]}の ${c}` : c);

let last = null;

export default {
  id: 'hira',
  title: 'おとを きいて もじを えらぼう',
  icon: 'あ',
  color: '#ff8787',
  howto: 'きこえた もじを タッチしてね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age === 4 ? 1 : age === 5 ? 2 : age === 6 ? 3 : 4),

  question(level, stats) {
    const L = LEVELS[level];
    const target = pickTarget(L.pool, stats, last);
    last = target;
    const choices = new Set([target]);
    if (L.tricky) for (const c of shuffle(similar(target))) if (choices.size < L.n) choices.add(c);
    const rest = shuffle(L.pool.filter((c) => !choices.has(c)));
    while (choices.size < L.n) choices.add(rest.pop());

    return {
      key: target,
      render(root, api) {
        const ask = async () => {
          // 「は は どれ」だと 助詞の「わ」に きこえるので「の もじ」と いう
          await api.speak(`${hintText(target)}。 ${target}の もじは どれかな？`);
        };
        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          <div class="choices kana n${L.n}">
            ${shuffle([...choices]).map((c) => `<button class="choice" data-c="${c}">${c}</button>`).join('')}
          </div>`;
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };
        let first = true;
        root.querySelectorAll('.choice').forEach((b) => {
          b.onclick = async () => {
            if (b.dataset.c === target) {
              api.correct(b);
              await api.speak(target);
              api.done(first);
            } else {
              first = false;
              api.wrong(b);
              await api.speak(`それは ${hintText(b.dataset.c)}`);
              ask();
            }
          };
        });
        ask();
      },
    };
  },
};
