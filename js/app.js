import { load, save, newProfile, today, exportJson, importJson } from './store.js';
import { speak, sfx, unlock, jaVoices, setVoice, currentVoice } from './sound.js';
import { ROBOTS, STAMPS_PER_ROBOT, PROFILE_ICONS, QUESTIONS_PER_ROUND } from './data.js';
import hiragana from './games/hiragana.js';
import count from './games/count.js';
import numberline from './games/numberline.js';
import maze from './games/maze.js';
import pattern from './games/pattern.js';
import oddone from './games/oddone.js';

const GAMES = [hiragana, count, numberline, maze, pattern, oddone];

const app = document.getElementById('app');
let data = load();
let me = null; // いま遊んでいる子のプロフィール

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const persist = () => save(data);
// 3さい以下は文字を出さず、絵と音声だけにする
const noText = () => me && me.age <= 3;

function view(html, cls = '') {
  app.className = cls + (noText() ? ' no-text' : '');
  app.innerHTML = html;
  return app;
}

document.addEventListener('pointerdown', unlock, { capture: true });

// ---------- 遊んだ時間 ----------
const limitMs = () => data.settings.limitMin * 60000;
const playedMs = (p) => p.play[today()] || 0;
const allowedMs = (p) => limitMs() + (p.extra[today()] || 0);
const timeUp = (p) => data.settings.limitMin > 0 && playedMs(p) >= allowedMs(p);
function addPlay(p, ms) {
  const d = today();
  p.play[d] = (p.play[d] || 0) + Math.min(ms, 10 * 60000); // 放置は最大10分まで数える
  persist();
}

// ---------- こどもを えらぶ ----------
function screenProfiles() {
  me = null;
  if (!data.profiles.length) return screenLock(screenParent);
  view(`
    <h1 class="title">だれが あそぶ？</h1>
    <div class="profiles">
      ${data.profiles.map((p) => `
        <button class="profile" data-id="${p.id}">
          <span class="big">${p.icon}</span><span class="name">${esc(p.name)}</span>
        </button>`).join('')}
    </div>
    <button class="gear" aria-label="おうちのひと">⚙️</button>`, 'screen-profiles');
  app.querySelectorAll('.profile').forEach((b) => {
    b.onclick = () => {
      me = data.profiles.find((p) => p.id === b.dataset.id);
      sfx.tap();
      speak(`${me.name}、 あそぼう！`);
      screenMenu();
    };
  });
  app.querySelector('.gear').onclick = () => screenLock(screenParent);
}

// ---------- ゲームいちらん ----------
function screenMenu() {
  if (timeUp(me)) return screenEnd();
  const robotsGot = me.robots.length;
  view(`
    <header class="bar">
      <button class="back" aria-label="もどる">⬅️</button>
      <span class="who">${me.icon} <span class="txt">${esc(me.name)}</span></span>
      <button class="stampbtn" aria-label="ずかん">⭐ ${me.stamps}　🤖 ${robotsGot}</button>
    </header>
    <div class="games">
      ${GAMES.map((g) => `
        <button class="game" data-id="${g.id}" style="--c:${g.color}">
          <span class="gicon">${g.icon}</span>
          <span class="txt">${g.title}</span>
        </button>`).join('')}
    </div>`, 'screen-menu');
  app.querySelector('.back').onclick = screenProfiles;
  app.querySelector('.stampbtn').onclick = screenZukan;
  app.querySelectorAll('.game').forEach((b) => {
    b.onclick = () => { sfx.tap(); screenIntro(GAMES.find((g) => g.id === b.dataset.id)); };
  });
}

// ---------- ゲームしょうかい → はじめる ----------
function screenIntro(game) {
  view(`
    <div class="intro" style="--c:${game.color}">
      <div class="gicon huge">${game.icon}</div>
      <h2 class="txt">${game.title}</h2>
      <p class="txt">${game.howto}</p>
      <div class="row">
        <button class="back" aria-label="もどる">⬅️</button>
        <button class="start">▶ <span class="txt">はじめる</span></button>
      </div>
    </div>`, 'screen-intro');
  speak(`${game.title}。 ${game.howto}`);
  app.querySelector('.back').onclick = () => { speechSynthesis.cancel(); screenMenu(); };
  app.querySelector('.start').onclick = () => { sfx.tap(); playRound(game); };
}

// ---------- 1かい（5もん）あそぶ ----------
async function playRound(game) {
  const started = Date.now();
  let level = me.levels[game.id] ?? game.startLevel(me.age);
  const stats = (me.stats[game.id] ||= {});
  let okCount = 0;
  let quit = false;

  for (let i = 0; i < QUESTIONS_PER_ROUND && !quit; i++) {
    const q = game.question(level, stats);
    view(`
      <header class="bar">
        <button class="back" aria-label="やめる">✖️</button>
        <div class="dots">${Array.from({ length: QUESTIONS_PER_ROUND }, (_, k) =>
          `<span class="dot ${k < i ? 'done' : k === i ? 'now' : ''}"></span>`).join('')}</div>
        <span></span>
      </header>
      <div class="stage"></div>`, 'screen-play');
    const firstOk = await new Promise((resolve) => {
      app.querySelector('.back').onclick = () => { quit = true; speechSynthesis.cancel(); resolve(null); };
      q.render(app.querySelector('.stage'), {
        speak,
        tap: sfx.tap,
        correct(el) { sfx.ok(); el.classList.add('ok'); lockChoices(); showMark(true); },
        wrong(el) { sfx.ng(); el.classList.add('ng'); el.disabled = true; showMark(false); },
        done: (ok) => setTimeout(() => resolve(ok), 500),
      });
    });
    if (firstOk === null) break;
    const s = (stats[q.key] ||= { n: 0, ok: 0 });
    s.n++;
    if (firstOk) { s.ok++; okCount++; }
  }

  addPlay(me, Date.now() - started);
  if (quit) { persist(); return screenMenu(); }

  // 正解率で難しさを自動で上げ下げする
  const rate = okCount / QUESTIONS_PER_ROUND;
  if (rate >= 0.8 && level < game.levels - 1) level++;
  else if (rate <= 0.4 && level > 0) level--;
  me.levels[game.id] = level;
  me.history.push({ game: game.id, at: Date.now(), ok: okCount, total: QUESTIONS_PER_ROUND });
  if (me.history.length > 300) me.history.splice(0, me.history.length - 300);

  // ごほうび（失敗しても スタンプは もらえる）
  me.stamps++;
  let robot = null;
  if (me.stamps % STAMPS_PER_ROBOT === 0) {
    robot = ROBOTS.find((r) => !me.robots.includes(r.id));
    if (robot) me.robots.push(robot.id);
  }
  persist();
  screenReward(game, robot);
}

// まるの ときは おおきな ⭕ と きらきら、ちがう ときは やさしく「おしい！」
function showMark(ok) {
  const m = document.createElement('div');
  m.className = 'mark-fx ' + (ok ? 'is-ok' : 'is-ng');
  m.innerHTML = ok
    ? '<span class="ring"></span>' + Array.from({ length: 10 }, (_, i) => `<span class="spark" style="--a:${i * 36}deg">✦</span>`).join('')
    : `<span class="oshii">🤔${noText() ? '' : '<b>おしい！</b>'}</span>`;
  document.body.appendChild(m);
  setTimeout(() => m.remove(), ok ? 900 : 800);
}

function lockChoices() {
  app.querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
}

function screenReward(game, robot) {
  const left = STAMPS_PER_ROBOT - (me.stamps % STAMPS_PER_ROBOT);
  view(`
    <div class="reward">
      <div class="stamp pop">⭐</div>
      <h2 class="txt">すたんぷ げっと！</h2>
      ${robot ? `
        <div class="newrobot pop"><span class="huge">${robot.emoji}</span><span class="badge">🤖</span></div>
        <p class="txt">あたらしい ろぼ 「${robot.name}」が なかまに なったよ！</p>` : `
        <p class="txt">あと ${left}こで あたらしい ろぼが くるよ</p>`}
      <div class="row">
        <button class="menu" aria-label="もどる">🏠</button>
        <button class="again">🔁 <span class="txt">もういちど</span></button>
      </div>
    </div>`, 'screen-reward');
  sfx.fanfare();
  speak(robot ? `すたんぷ げっと！ ${robot.name}が なかまに なったよ！` : 'すたんぷ げっと！ よく がんばったね！');
  app.querySelector('.menu').onclick = screenMenu;
  app.querySelector('.again').onclick = () => (timeUp(me) ? screenEnd() : playRound(game));
}

// ---------- ずかん ----------
function screenZukan() {
  view(`
    <header class="bar">
      <button class="back" aria-label="もどる">⬅️</button>
      <span class="txt">ろぼ ずかん</span>
      <span>⭐ ${me.stamps}</span>
    </header>
    <div class="zukan">
      ${ROBOTS.map((r) => {
        const got = me.robots.includes(r.id);
        return `<button class="card ${got ? 'got' : ''}" data-id="${r.id}">
          <span class="big">${got ? r.emoji : '❓'}</span>
          <span class="txt">${got ? r.name : '？？？'}</span></button>`;
      }).join('')}
    </div>`, 'screen-zukan');
  app.querySelector('.back').onclick = screenMenu;
  app.querySelectorAll('.card.got').forEach((c) => {
    c.onclick = () => speak(ROBOTS.find((r) => r.id === c.dataset.id).name);
  });
}

// ---------- じかん おしまい ----------
function screenEnd() {
  view(`
    <div class="end">
      <div class="huge">🌙</div>
      <h2 class="txt">きょうは おしまい！</h2>
      <p class="txt">また あした あそぼうね</p>
      <div class="row">
        <button class="menu" aria-label="もどる">🏠</button>
        <button class="gear" aria-label="おうちのひと">⚙️</button>
      </div>
    </div>`, 'screen-end');
  speak('きょうは おしまい！ また あした あそぼうね');
  app.querySelector('.menu').onclick = screenProfiles;
  app.querySelector('.gear').onclick = () => screenLock(screenParent);
}

// ---------- おうちのひと ロック（かけ算） ----------
function screenLock(next) {
  const back = me;
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  let input = '';
  view(`
    <div class="lock">
      <p>おうちの ひと だけ</p>
      <p class="q">${a} × ${b} = <span class="in">?</span></p>
      <div class="pad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}
      </div>
      ${data.profiles.length ? '<button class="cancel">もどる</button>' : ''}
    </div>`, 'screen-lock');
  const show = () => { app.querySelector('.in').textContent = input || '?'; };
  app.querySelectorAll('.pad button').forEach((btn) => {
    btn.onclick = () => {
      const k = btn.dataset.k;
      if (k === 'C') input = '';
      else if (k === 'OK') {
        if (Number(input) === a * b) return next(back);
        input = '';
        sfx.ng();
      } else if (input.length < 3) input += k;
      show();
    };
  });
  app.querySelector('.cancel')?.addEventListener('click', () => {
    me = back;
    me ? screenMenu() : screenProfiles();
  });
}

// ---------- おうちのひと画面 ----------
function accuracy(p, gameId, days = 7) {
  const since = Date.now() - days * 86400000;
  const h = p.history.filter((x) => x.game === gameId && x.at >= since);
  const n = h.reduce((a, x) => a + x.total, 0);
  return n ? Math.round((100 * h.reduce((a, x) => a + x.ok, 0)) / n) + '%（' + h.length + 'かい）' : '—';
}

function weakest(p, gameId) {
  const st = p.stats[gameId] || {};
  return Object.entries(st)
    .filter(([, s]) => s.n >= 2 && s.ok < s.n)
    .sort(([, a], [, b]) => a.ok / a.n - b.ok / b.n)
    .slice(0, 8)
    .map(([k, s]) => `${esc(k)}<small>${s.ok}/${s.n}</small>`)
    .join(' ') || '—';
}

function screenParent(back) {
  me = null;
  view(`
    <header class="bar">
      <button class="back">⬅️ もどる</button>
      <span>おうちのひと</span><span></span>
    </header>
    <div class="parent">
      <section>
        <h3>こども</h3>
        ${data.profiles.map((p) => `
          <div class="pcard">
            <div class="phead"><span class="big">${p.icon}</span><b>${esc(p.name)}</b>
              <label>ねんれい
                <select data-age="${p.id}">${[3, 4, 5, 6, 7, 8].map((a) => `<option ${a === p.age ? 'selected' : ''}>${a}</option>`).join('')}</select>
              </label>
              <button class="del" data-del="${p.id}">けす</button>
            </div>
            <table>
              <tr><th></th><th>さいきん7日の せいかいりつ</th><th>にがて（せいかい/かいすう）</th><th>レベル</th></tr>
              ${GAMES.map((g) => `<tr><td>${g.icon}</td><td>${accuracy(p, g.id)}</td><td class="weak">${weakest(p, g.id)}</td>
                <td>${(p.levels[g.id] ?? g.startLevel(p.age)) + 1} / ${g.levels}</td></tr>`).join('')}
            </table>
            <p class="muted">きょう ${Math.round(playedMs(p) / 60000)}ふん あそんだ　⭐${p.stamps}　🤖${p.robots.length}
              ${timeUp(p) ? `<button data-extend="${p.id}">＋15ふん えんちょう</button>` : ''}</p>
          </div>`).join('') || '<p class="muted">まだ いません。したで ついか してください。</p>'}
        <form class="add">
          <input name="name" placeholder="なまえ（ひらがな）" required maxlength="10">
          <select name="age">${[3, 4, 5, 6, 7, 8].map((a) => `<option>${a}</option>`).join('')}</select>
          <div class="icons">${PROFILE_ICONS.map((ic, i) => `<label><input type="radio" name="icon" value="${ic}" ${i === 0 ? 'checked' : ''}><span>${ic}</span></label>`).join('')}</div>
          <button>ついか</button>
        </form>
      </section>
      <section>
        <h3>1日に あそべる じかん</h3>
        <select class="limit">${[0, 10, 15, 20, 30, 45, 60].map((m) => `<option value="${m}" ${m === data.settings.limitMin ? 'selected' : ''}>${m ? m + 'ふん' : 'せいげん なし'}</option>`).join('')}</select>
      </section>
      <section>
        <h3>こえ</h3>
        <p class="muted">声が機械っぽいときは、iPadの「設定 → アクセシビリティ → 読み上げコンテンツ → 声 → 日本語」で「プレミアム」や「拡張」の声をダウンロードすると、ここに出てきます。</p>
        <select class="voice">${jaVoices().map((v) => `<option value="${esc(v.voiceURI)}" ${v === currentVoice() ? 'selected' : ''}>${esc(v.name)}</option>`).join('') || '<option>（日本語の声が見つかりません）</option>'}</select>
        <button class="trysay">▶ ためしに きく</button>
      </section>
      <section>
        <h3>バックアップ</h3>
        <p class="muted">ホーム画面のアイコンを消すと記録も消えます。ときどき書き出しておいてください。</p>
        <button class="export">かきだす</button>
        <label class="import">よみこむ<input type="file" accept="application/json,.json" hidden></label>
      </section>
    </div>`, 'screen-parent');

  const rerender = () => screenParent(back);
  app.querySelector('.back').onclick = () => {
    if (!data.profiles.length) return;
    if (back) { me = data.profiles.find((p) => p.id === back.id) || null; }
    me ? screenMenu() : screenProfiles();
  };
  app.querySelectorAll('[data-age]').forEach((s) => {
    s.onchange = () => { data.profiles.find((p) => p.id === s.dataset.age).age = Number(s.value); persist(); };
  });
  app.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = () => {
      const p = data.profiles.find((x) => x.id === b.dataset.del);
      if (!confirm(`${p.name} の きろくを ぜんぶ けします。いいですか？`)) return;
      data.profiles = data.profiles.filter((x) => x !== p);
      persist(); rerender();
    };
  });
  app.querySelectorAll('[data-extend]').forEach((b) => {
    b.onclick = () => {
      const p = data.profiles.find((x) => x.id === b.dataset.extend);
      p.extra[today()] = (p.extra[today()] || 0) + 15 * 60000;
      persist(); rerender();
    };
  });
  app.querySelector('.add').onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    data.profiles.push(newProfile({ name: f.get('name').trim(), age: Number(f.get('age')), icon: f.get('icon') }));
    persist(); rerender();
  };
  app.querySelector('.limit').onchange = (e) => { data.settings.limitMin = Number(e.target.value); persist(); };
  app.querySelector('.voice').onchange = (e) => { setVoice(e.target.value); speak('こんにちは！ いっしょに あそぼう'); };
  app.querySelector('.trysay').onclick = () => speak('こんにちは！ いっしょに あそぼう');
  app.querySelector('.export').onclick = async () => {
    const text = exportJson(data);
    const file = new File([text], `kids-minigames-${today()}.json`, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); } catch { /* キャンセル */ }
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = file.name;
      a.click();
    }
  };
  app.querySelector('.import input').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const d = importJson(await f.text());
      if (!confirm(`こども ${d.profiles.length}人ぶんの きろくで うわがき します。いいですか？`)) return;
      data = d; persist(); rerender();
    } catch (err) {
      alert('よみこめませんでした: ' + err.message);
    }
  };
}

// ---------- はじめ ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js');
}
screenProfiles();
