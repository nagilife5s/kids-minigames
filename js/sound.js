// 読み上げ（Web Speech API）と効果音（WebAudio で合成。音源ファイル不要）
let voice = null;
let ctx = null;

const VOICE_KEY = 'kids-minigames.voice';

export const jaVoices = () =>
  ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter((v) => v.lang.startsWith('ja'));

// 親画面で選んだ声 → 高品質版（プレミアム／拡張）→ そのほか の順で選ぶ
function pickVoice() {
  const vs = jaVoices();
  let saved = null;
  try { saved = localStorage.getItem(VOICE_KEY); } catch { /* 無視 */ }
  const score = (v) => (/premium|プレミアム/i.test(v.name) ? 3 : /enhanced|拡張/i.test(v.name) ? 2 : /kyoko|o-ren|otoya/i.test(v.name) ? 1 : 0);
  voice = vs.find((v) => v.voiceURI === saved) || [...vs].sort((a, b) => score(b) - score(a))[0] || null;
}

export function setVoice(uri) {
  try { localStorage.setItem(VOICE_KEY, uri); } catch { /* 無視 */ }
  pickVoice();
}
export const currentVoice = () => voice;
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

// iPad はタップの中で一度鳴らさないと音が出ないので、最初のタップで起こす
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  ctx?.resume?.();
  if ('speechSynthesis' in window && !voice) pickVoice();
}

// iPad の Safari は cancel 直後の speak が 鳴らなかったり、Utterance が 消えて onend が 来なかったり するので、
// いまの Utterance を 持っておき、cancel したときは 少し まってから 話す
let current = null;
export function speak(text, { rate = 0.85, pitch = 1.1, cancel = true } = {}) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  const wasBusy = speechSynthesis.speaking || speechSynthesis.pending;
  if (cancel) speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = rate;
    u.pitch = pitch;
    if (voice) u.voice = voice;
    let timer = null;
    const finish = () => { clearTimeout(timer); if (current === u) current = null; resolve(); };
    u.onend = u.onerror = finish;
    current = u;
    timer = setTimeout(finish, 4000 + text.length * 250); // onend が 来ない ときの 保険
    if (cancel && wasBusy) setTimeout(() => speechSynthesis.speak(u), 60);
    else speechSynthesis.speak(u);
  });
}

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume?.(); // 裏から もどると iPad は 止めて しまう
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.1),
  ok: () => { tone(784, 0, 0.15); tone(1047, 0.12, 0.3); },
  ng: () => { tone(330, 0, 0.18, 'triangle'); tone(262, 0.15, 0.25, 'triangle'); },
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.35, 'triangle')),
};
