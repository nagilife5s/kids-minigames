// ずかんの え（img/zukan/<なまえ>.png）と なかま わけ
export const CATS = {
  animal: { name: 'どうぶつ', items: ['いぬ', 'ねこ', 'うさぎ', 'くま', 'ぱんだ', 'らいおん', 'ぞう', 'きりん', 'ごりら', 'さる', 'うし', 'ぶた', 'かえる', 'かめ', 'たぬき', 'こあら'] },
  fruit: { name: 'くだもの', items: ['りんご', 'ばなな', 'ぶどう', 'いちご', 'もも', 'みかん', 'すいか', 'なし'] },
  veg: { name: 'やさい', items: ['にんじん', 'なす', 'きゅうり', 'とまと', 'とうもろこし', 'ぶろっこりー', 'かぼちゃ', 'だいこん'] },
  sea: { name: 'うみの いきもの', items: ['さかな', 'かに', 'たこ', 'いか', 'くじら', 'らっこ', 'ぺんぎん'] },
  bug: { name: 'むし', items: ['ちょう', 'ばった', 'せみ', 'てんとうむし', 'はち', 'かぶとむし', 'とんぼ'] },
  bird: { name: 'とり', items: ['ひよこ', 'あひる', 'ぺんぎん'] },
  food: { name: 'たべもの', items: ['けーき', 'らーめん', 'かれー', 'おにぎり', 'ぱん', 'だんご'] },
  tool: { name: 'みの まわりの もの', items: ['かさ', 'くつ', 'ぼうし', 'めがね', 'とけい', 'ほうき', 'こっぷ', 'ふうせん', 'らっぱ', 'きっぷ'] },
  road: { name: 'みちを はしる のりもの', items: ['くるま', 'ばす', 'ぱとかー', 'きゅうきゅうしゃ', 'しょうぼうしゃ', 'とらっく', 'とらくたー', 'しゃべるかー', 'じてんしゃ'] },
  rail: { name: 'せんろを はしる のりもの', items: ['でんしゃ', 'しんかんせん'] },
  sky: { name: 'そらを とぶ のりもの', items: ['ひこうき', 'へりこぷたー', 'ろけっと'] },
  water: { name: 'みずの うえを すすむ のりもの', items: ['ふね', 'よっと'] },
};

export const ALL = [...new Set(Object.values(CATS).flatMap((c) => c.items))];
const HAS = new Set(ALL);
export const has = (name) => HAS.has(name);
export const src = (name) => `img/zukan/${encodeURIComponent(name)}.png`;

// え の html。ずかんに ない ものは えもじ など（alt）を そのまま だす
export const pic = (name, alt = '', cls = '') =>
  has(name) ? `<img class="zk ${cls}" src="${src(name)}" alt="${name}" draggable="false">` : `<span class="zk-emo ${cls}">${alt || name}</span>`;

export const catOf = (name) => Object.keys(CATS).find((k) => CATS[k].items.includes(name));
