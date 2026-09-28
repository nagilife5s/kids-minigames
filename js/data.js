// 図鑑のろぼ（仮の絵文字。あとで Nano Banana の画像に差し替える）
export const ROBOTS = [
  { id: 'car', name: 'くるまろぼ', emoji: '🚗' },
  { id: 'fire', name: 'しょうぼうろぼ', emoji: '🚒' },
  { id: 'police', name: 'ぱとかーろぼ', emoji: '🚓' },
  { id: 'ambulance', name: 'きゅうきゅうろぼ', emoji: '🚑' },
  { id: 'bus', name: 'ばすろぼ', emoji: '🚌' },
  { id: 'tractor', name: 'とらくたーろぼ', emoji: '🚜' },
  { id: 'truck', name: 'とらっくろぼ', emoji: '🚚' },
  { id: 'train', name: 'でんしゃろぼ', emoji: '🚃' },
  { id: 'shinkansen', name: 'しんかんせんろぼ', emoji: '🚄' },
  { id: 'plane', name: 'ひこうきろぼ', emoji: '✈️' },
  { id: 'heli', name: 'へりろぼ', emoji: '🚁' },
  { id: 'ship', name: 'ふねろぼ', emoji: '🚢' },
  { id: 'rocket', name: 'ろけっとろぼ', emoji: '🚀' },
];

// スタンプ何こでろぼが1たい手に入るか
for (const r of ROBOTS) r.img = `img/robots/${r.id}.png`;

export const STAMPS_PER_ROBOT = 3;

export const PROFILE_ICONS = ['🚗', '🚒', '🚓', '🚑', '🚌', '🚜', '🚄', '✈️', '🚀', '🤖'];

export const VEHICLES = ['🚗', '🚒', '🚓', '🚑', '🚌', '🚜', '🚚', '🚃', '✈️', '🚁', '🚢', '🚀'];

export const QUESTIONS_PER_ROUND = 5;

// ずかんの え が ある みちの のりもの（かぞえる・すうじの せん・めいろ で つかう）
export const ROAD_PICS = ['くるま', 'ばす', 'しょうぼうしゃ', 'ぱとかー', 'きゅうきゅうしゃ', 'とらっく', 'とらくたー', 'しゃべるかー'];
