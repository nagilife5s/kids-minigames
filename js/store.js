// 進捗は iPad の localStorage にだけ保存する
const KEY = 'kids-minigames.v1';

const fresh = () => ({ version: 1, profiles: [], settings: { limitMin: 15 } });

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const d = JSON.parse(raw);
    return { ...fresh(), ...d, settings: { ...fresh().settings, ...(d.settings || {}) } };
  } catch {
    return fresh();
  }
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
  return { ...fresh(), ...d };
}
