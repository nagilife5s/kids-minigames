// 進捗は iPad の localStorage にだけ保存する
const KEY = 'kids-minigames.v1';

const fresh = () => ({ version: 1, profiles: [], settings: { limitMin: 15 } });

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return normalize(JSON.parse(raw));
  } catch {
    return fresh();
  }
}

// 古い・かけた データでも 落ちないよう、たりない こうもくを おぎなう
function normalize(d) {
  const base = fresh();
  const profiles = (Array.isArray(d.profiles) ? d.profiles : [])
    .filter((p) => p && p.id)
    .map((p) => {
      const blank = newProfile({ name: p.name || '？', icon: p.icon || '🚗', age: Number(p.age) || 6 });
      const out = { ...blank, ...p };
      for (const k of ['levels', 'stats', 'play', 'extra', 'seen', 'recent', 'todayStamps']) {
        if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {};
      }
      for (const k of ['history', 'robots']) if (!Array.isArray(out[k])) out[k] = [];
      out.stamps = Number(out.stamps) || 0;
      return out;
    });
  return { ...base, ...d, profiles, settings: { ...base.settings, ...(d.settings || {}) } };
}

export function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* 容量オーバー等は無視 */ }
}

export function newProfile({ name, icon, age }) {
  return {
    id: 'p' + Date.now().toString(36),
    name, icon, age,
    levels: {},        // gameId -> level
    stats: {},         // gameId -> { key: { n, ok } }
    history: [],       // { game, at, ok, total }
    stamps: 0,
    robots: [],        // 図鑑で手に入れたロボの id
    play: {},          // 'YYYY-MM-DD' -> 遊んだミリ秒
    extra: {},         // 'YYYY-MM-DD' -> 親が延長したミリ秒
  };
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function exportJson(data) {
  return JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 1);
}

export function importJson(text) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.profiles)) throw new Error('形式がちがいます');
  return normalize(d);
}
