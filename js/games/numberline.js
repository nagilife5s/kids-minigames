// すうじの せん（数直線）
// locate: いわれた数の ばしょを タッチ ／ blank: ？の数を えらぶ
// add: a から b すすむと どこ？ ／ compare: どっちが おおきい？
import { VEHICLES } from '../data.js';

const LEVELS = [
  { max: 5, labels: 'all', modes: ['locate'] },
  { max: 10, labels: 'all', modes: ['locate'] },
  { max: 10, labels: 5, modes: ['locate', 'compare'] },
  { max: 10, labels: 'all', modes: ['add', 'blank'] },
  { max: 20, labels: 5, modes: ['locate', 'blank', 'add'] },
  { max: 20, labels: 10, modes: ['add', 'compare', 'locate'] },
];

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[rand(0, a.length - 1)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function shownLabel(L, v) {
  return L.labels === 'all' || v % L.labels === 0;
}

function makeProblem(L) {
  const mode = pick(L.modes);
  if (mode === 'locate') {
    const v = rand(1, L.max);
    return { mode, key: String(v), answer: v, say: `${v} は どこかな？` };
  }
  if (mode === 'blank') {
    const v = rand(1, L.max - 1);
    return { mode, key: `?${v}`, answer: v, start: v, say: 'はてなの ところは いくつかな？' };
  }
  if (mode === 'add') {
    const b = rand(1, Math.min(5, L.max - 1));
    const a = rand(0, L.max - b);
    return { mode, key: `${a}+${b}`, answer: a + b, start: a, step: b, say: `${a} から ${b} すすむと どこかな？` };
  }
  let a = rand(1, L.max);
  let b;
  do b = rand(Math.max(1, a - 5), Math.min(L.max, a + 5)); while (b === a);
  return { mode, key: `${Math.min(a, b)}<${Math.max(a, b)}`, answer: Math.max(a, b), pair: [a, b], say: `${a} と ${b}、 おおきいのは どっちかな？` };
}

let lastKey = null;

export default {
  id: 'line',
  title: 'すうじの せんで ぶーん',
  icon: '📏',
  color: '#8ce99a',
  howto: 'のりものが すうじの せんを はしるよ。いわれた ところを タッチしてね',
  levels: LEVELS.length,
  startLevel: (age) => (age <= 3 ? 0 : age <= 5 ? 1 : age === 6 ? 3 : 4),

  question(level) {
    const L = LEVELS[level];
    let p;
    do p = makeProblem(L); while (p.key === lastKey);
    lastKey = p.key;
    const rider = pick(VEHICLES);
    const n = L.max + 1;

    return {
      key: p.key,
      render(root, api) {
        const tappable = p.mode === 'locate' || p.mode === 'add';
        const ticks = Array.from({ length: n }, (_, v) => {
          const hide = p.mode === 'blank' && v === p.answer;
          const lab = hide ? '？' : shownLabel(L, v) || (p.mode === 'add' && v === p.start) ? v : '';
          return `<button class="tick ${tappable ? 'choice' : ''} ${hide ? 'blank' : ''}" data-v="${v}" ${tappable ? '' : 'tabindex="-1"'}>
            <span class="mark"></span><span class="lab">${lab}</span></button>`;
        }).join('');

        let choicesHtml = '';
        if (p.mode === 'blank') {
          const cs = new Set([p.answer]);
          for (let d = 1; cs.size < 3; d++) for (const c of [p.answer - d, p.answer + d]) if (c >= 0 && c <= L.max && cs.size < 3) cs.add(c);
          choicesHtml = [...cs].sort((a, b) => a - b).map((c) => `<button class="choice" data-c="${c}">${c}</button>`).join('');
        } else if (p.mode === 'compare') {
          choicesHtml = p.pair.map((c) => `<button class="choice" data-c="${c}">${c}</button>`).join('');
        }

        root.innerHTML = `
          <button class="replay" aria-label="もういちど きく">🔊</button>
          ${p.mode === 'add' ? `<div class="plus">${p.start} ＋ ${p.step} ＝ ？</div>` : ''}
          <div class="nl" style="--n:${n}">
            <div class="rider" style="--v:${p.start ?? 0}">${rider}</div>
            <div class="rail"></div>
            ${ticks}
          </div>
          ${choicesHtml ? `<div class="choices nums n${p.mode === 'compare' ? 2 : 3}">${choicesHtml}</div>` : ''}`;

        const riderEl = root.querySelector('.rider');
        if (p.mode === 'locate' || p.mode === 'compare') riderEl.style.visibility = 'hidden';
        const ask = () => api.speak(p.say);
        root.querySelector('.replay').onclick = () => { api.tap(); ask(); };

        // のりものを 1めもりずつ すすめる
        let at = p.start ?? 0;
        const hopTo = async (to, count) => {
          riderEl.style.visibility = 'visible';
          while (at !== to) {
            at += at < to ? 1 : -1;
            riderEl.style.setProperty('--v', at);
            riderEl.classList.remove('hop'); void riderEl.offsetWidth; riderEl.classList.add('hop');
            api.tap();
            if (count) api.speak(String(Math.abs(at - p.start)), { rate: 1.1 });
            await sleep(420);
          }
        };

        let first = true;
        const finish = async (el) => {
          api.correct(el);
          if (p.mode === 'add') { await hopTo(p.answer, true); await api.speak(`${p.answer}！`); }
          else if (p.mode === 'locate') { at = p.answer; riderEl.style.setProperty('--v', at); riderEl.style.visibility = 'visible'; riderEl.classList.add('hop'); await api.speak(`${p.answer}！`); }
          else if (p.mode === 'blank') { root.querySelector('.tick.blank .lab').textContent = p.answer; await api.speak(`${p.answer}！`); }
          else {
            for (const v of p.pair) root.querySelector(`.tick[data-v="${v}"]`).classList.add('mark-on');
            await api.speak(`${p.answer} の ほうが おおきいね`);
          }
          api.done(first);
        };
        const miss = async (el, v) => {
          first = false;
          api.wrong(el);
          if (p.mode === 'locate' || p.mode === 'add') { await api.speak(`そこは ${v} だよ`); ask(); return; }
          if (p.mode === 'compare') {
            for (const x of p.pair) root.querySelector(`.tick[data-v="${x}"]`).classList.add('mark-on');
            await api.speak('せんの みぎに あるほうが おおきいよ');
            return;
          }
          await api.speak(`${p.answer - 1} の つぎは いくつかな？`);
        };

        if (tappable) {
          root.querySelectorAll('.tick').forEach((t) => {
            t.onclick = () => {
              const v = Number(t.dataset.v);
              if (v === p.answer) finish(t); else miss(t, v);
            };
          });
        }
        root.querySelectorAll('.choices .choice').forEach((b) => {
          b.onclick = () => (Number(b.dataset.c) === p.answer ? finish(b) : miss(b));
        });
        ask();
      },
    };
  },
};
