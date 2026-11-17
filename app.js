'use strict';
/* KB Theorem: a kettlebell and movement-break tracker.
   Everything is stored in this browser's localStorage. The app sends nothing anywhere. */

const KEY = 'kbt-data-v1';
const DAY = 864e5, TARGET = 5, STUDY = 265, KCAL = 0.6, MOVE_TARGET = 6;
const ROTA = ['A','L','B','L','A','L','B'];        // Sunday to Saturday
const AR = [3,3,3,3,4,4,4,4], AP = [8,8,10,10,10,10,12,12];
const AS = ['8','8','10','10','10','10','10, 3-sec lowering','10, 3-sec lowering'];
const BMIN = [10,12,12,12,10,12,12,10], BPER = [15,15,18,20,20,20,22,15], BONE = [0,0,0,0,1,1,0,0];
const DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], DS = ['S','M','T','W','T','F','S'];
const AREAS = ['Hips','Spine','Shoulders','Ankles'];
const DRILLS = [
  {id:'walk',  name:'Walk',                      dose:'2 minutes, anywhere',              area:'Whole body'},
  {id:'sit',   name:'Sit-to-stands',             dose:'10 from a chair, no hands',        area:'Hips'},
  {id:'hip',   name:'Hip circles',               dose:'10 each way, each leg',            area:'Hips'},
  {id:'cat',   name:'Cat-cow',                   dose:'10 slow reps, hands on a desk',    area:'Spine'},
  {id:'twist', name:'Standing twists',           dose:'10 each side, easy range',         area:'Spine'},
  {id:'arm',   name:'Arm circles, shoulder rolls', dose:'10 each way',                    area:'Shoulders'},
  {id:'door',  name:'Doorway chest stretch',     dose:'30 seconds each side',             area:'Shoulders'},
  {id:'calf',  name:'Calf raises',               dose:'20, hold something for balance',   area:'Ankles'},
  {id:'ankle', name:'Ankle circles',             dose:'10 each way, each foot',           area:'Ankles'}
];
const ALARMS = [['Kettlebell','9:00 PM, every day'], ['Movement break','10 AM, 12, 2, 4, 6 and 8 PM, every day']];

/* ---------- dates ---------- */
const pd = s => { const [y,m,d] = s.split('-').map(Number); return Date.UTC(y,m-1,d); };
const iso = t => new Date(t).toISOString().slice(0,10);
const todayIso = () => { const n = new Date(); return iso(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); };
const add = (s,n) => iso(pd(s) + n*DAY);
const dow = s => new Date(pd(s)).getUTCDay();
const nice = s => new Date(pd(s)).toLocaleDateString(undefined, {month:'short', day:'numeric', timeZone:'UTC'});
const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const isDate = s => typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s) && !isNaN(pd(s));

/* ---------- state, kept on this device only ---------- */
function fresh(){ const t = todayIso(); return {v:1, start:add(t, -dow(t)), days:{}, moves:{}, ack:false}; }
// Accept only the shape this app writes, so a bad or tampered backup cannot inject anything.
function clean(o){
  const s = fresh();
  if(!o || typeof o !== 'object') return s;
  if(isDate(o.start)) s.start = add(o.start, -dow(o.start));
  s.ack = o.ack === true;
  const txt = (v,n) => String(v ?? '').slice(0,n);
  if(o.days && typeof o.days === 'object') for(const d of Object.keys(o.days).slice(0,4000)){
    const l = o.days[d]; if(!isDate(d) || !l || typeof l !== 'object') continue;
    s.days[d] = {done:l.done === true, main:l.main === true, amt:txt(l.amt,6), swings:txt(l.swings,6), rpe:txt(l.rpe,4),
                 count:txt(l.count,6), test:l.test === 'base' || l.test === 'final' ? l.test : '', note:txt(l.note,300), at:Number(l.at) || 0};
  }
  if(o.moves && typeof o.moves === 'object') for(const d of Object.keys(o.moves).slice(0,4000)){
    if(!isDate(d) || !Array.isArray(o.moves[d])) continue;
    s.moves[d] = o.moves[d].slice(0,60).filter(m => m && DRILLS.some(x => x.id === m.id) && Number(m.t) > 0).map(m => ({id:m.id, t:Number(m.t)}));
  }
  return s;
}
let STATE, storageOK = true;
try{ STATE = clean(JSON.parse(localStorage.getItem(KEY) || 'null')); }catch(e){ STATE = fresh(); storageOK = false; }
const statusEl = document.getElementById('status');
function say(msg, bad){ statusEl.textContent = msg; statusEl.className = bad ? 'bad' : ''; }
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(STATE)); say('Saved on this phone'); }
  catch(e){ storageOK = false; say("Couldn't save. This browser is blocking storage, so use Setup to export a backup.", true); }
}

/* ---------- the program ---------- */
const wk = s => Math.floor((pd(s) - pd(STATE.start)) / DAY / 7);
const wkDates = w => Array.from({length:7}, (_,i) => add(STATE.start, w*7+i));
const blank = () => ({done:false, main:false, amt:'', swings:'', rpe:'', count:'', test:'', note:'', at:0});
const log = s => Object.assign(blank(), STATE.days[s] || {});
function weekResult(w){
  const ds = wkDates(w), c = ds.filter(d => log(d).done).length;
  const b = ds.some(d => ROTA[dow(d)] === 'B' && (log(d).main || num(log(d).count) > 0));
  return {c, b, pass: c >= 4 && b};
}
// Level follows what got done: a good week goes up one, an empty week comes back one.
function levelAt(w){
  let l = 1;
  for(let i = 0; i < w; i++){ const r = weekResult(i); if(r.pass) l = Math.min(8, l+1); else if(r.c === 0) l = Math.max(1, l-1); }
  return l;
}
const findTest = kind => Object.keys(STATE.days).sort().find(d => STATE.days[d].test === kind && num(STATE.days[d].count) > 0) || '';
const AXIOM = [['h','Axiom','every day'], ['','Swings','50 two-hand, unbroken'], ['','Halos','5 each way']];
function plan(s){
  const t = ROTA[dow(s)], L = levelAt(wk(s)), k = L-1, l = log(s);
  const p = {date:s, t, L, test:'', main:null, per:0, mainSwings:0, clock:0, title:'Axiom only', moves:AXIOM, tip:'Three minutes. On a walk day this is the whole session.'};
  if(t === 'A'){
    p.title = 'Strength rounds'; p.main = {label:'Rounds done', done:'Rounds done', n:AR[k]}; p.per = 20; p.mainSwings = AR[k]*20;
    p.moves = [...AXIOM, ['h','Then', AR[k]+' rounds, rest between rounds'], ['','Overhead press', AP[k]+' / arm'], ['','Bulgarian split squat', AS[k]+' / leg'], ['','Swings','20 two-hand, fast']];
    p.tip = 'Do the split squats with no weight until every rep is steady, then hold the bell at your chest.';
  }
  if(t === 'B'){
    const sat = dow(s) === 6, base = findTest('base'), fin = findTest('final');
    let test = l.test;
    if(!test && sat && L <= 3 && (!base || base === s)) test = 'base';
    if(!test && sat && L === 8 && (!fin || fin === s)) test = 'final';
    if(test){
      p.test = test; p.clock = 12; p.title = test === 'base' ? '12-minute baseline' : '12-minute retest';
      p.moves = [['h','Warm-up',''], ['','Halos','5 each way'], ['','Swings','20 easy'], ['h','Test','12:00 on the clock'], ['','Swings','as many good reps as you can']];
      p.tip = 'Start the clock. Swing, park the bell and rest whenever you want, and count every rep. Stop early if your form slips or the effort passes 8 out of 10.';
    } else {
      const one = BONE[k];
      p.title = 'Density block'; p.clock = BMIN[k]; p.main = {label:'Minutes done', done:'Block done', n:BMIN[k]}; p.per = BPER[k]; p.mainSwings = BMIN[k]*BPER[k];
      p.moves = [...AXIOM, ['h','Then', BMIN[k]+'-minute block'], ['','Swings', (one ? (BPER[k]/2)+' / arm' : BPER[k]+' two-hand')+', top of every minute'], ['','Rest','whatever is left of the minute']];
      p.tip = 'Start the clock. It buzzes at the top of each minute: swing, then rest until the next buzz. If form slips or effort passes 8 out of 10, stop and log the minutes you finished.';
    }
  }
  return p;
}
function swingsOn(s){
  const l = log(s), p = plan(s);
  if(num(l.swings)) return num(l.swings);
  if(p.test) return num(l.count);
  const main = l.amt !== '' ? Math.min(num(l.amt), p.main ? p.main.n : 0) * p.per : (l.main ? p.mainSwings : 0);
  return (l.done ? 50 : 0) + main;
}
const plannedOn = s => { const p = plan(s); return p.test ? 0 : 50 + p.mainSwings; };
function streak(){
  let d = todayIso(), n = 0;
  if(!log(d).done) d = add(d,-1);
  while(pd(d) >= pd(STATE.start) && log(d).done){ n++; d = add(d,-1); }
  return n;
}
const lastDone = () => Object.keys(STATE.days).filter(d => STATE.days[d].done).sort().pop() || '';

/* ---------- movement breaks ---------- */
const movesOn = d => STATE.moves[d] || [];
const areasOn = d => new Set(movesOn(d).map(m => (DRILLS.find(x => x.id === m.id) || {}).area));
function lastMoved(){
  const t = todayIso(), y = add(t,-1);
  return Math.max(0, ...movesOn(t).map(m => m.t), ...movesOn(y).map(m => m.t), log(t).at || 0, log(y).at || 0);
}
function suggest(){
  const t = todayIso(), got = areasOn(t), n = movesOn(t).length;
  const open = AREAS.filter(a => !got.has(a));
  if(n % 3 === 0 && !movesOn(t).some(m => m.id === 'walk')) return DRILLS[0];
  const pool = DRILLS.filter(d => open.length ? open.includes(d.area) : d.id !== 'walk');
  return pool[n % pool.length];
}
function span(ms){ const m = Math.floor(ms/60000); return m < 60 ? m + ' min' : Math.floor(m/60) + ' h ' + String(m%60).padStart(2,'0') + ' m'; }

/* ---------- views ---------- */
let tab = 'today', sel = todayIso(), armed = '';
try{ const t = sessionStorage.getItem('kbt-tab'); if(['today','move','plan','proof','setup'].includes(t)) tab = t; }catch(e){}
const $ = id => document.getElementById(id);

function gateCard(){
  return `<div class="card gate">
    <div class="card-top"><span class="n">Before you start</span><span class="tag T">Read once</span></div>
    <p class="lead">Swings are fast, hard work. Talk to a doctor before using this plan if any of these fit you:</p>
    <ul class="plain">
      <li>A heart condition, or blood pressure that is not under control</li>
      <li>Chest pain, fainting or dizziness when you exert yourself</li>
      <li>A back, joint or bone problem that exercise makes worse</li>
      <li>You have been told to exercise only under supervision</li>
    </ul>
    <p class="lead">During any session: stop if you get chest pain, feel faint, or get short of breath in a way that feels wrong. This app is a logbook, not medical advice.</p>
    <div class="row"><button class="btn" data-act="ack">I have read this</button></div>
  </div>`;
}
function clockBox(p){
  if(!p.clock) return '';
  return `<div class="clock" id="clock"><div class="t" id="clock-t">${String(p.clock).padStart(2,'0')}:00</div><div class="m" id="clock-m">${p.clock}-minute clock. Keep this screen open while it runs.</div>
    <div class="row"><button class="btn small" data-act="clock" data-min="${p.clock}" data-per="${p.test ? 0 : p.per}">Start clock</button><button class="btn small ghost" data-act="clock-stop">Stop</button></div></div>`;
}
function dayCard(s){
  const p = plan(s), l = log(s), today = todayIso(), future = pd(s) > pd(today);
  const tag = p.test ? ['T','Test'] : p.t === 'A' ? ['A','A · Strength'] : p.t === 'B' ? ['B','B · Density'] : ['L','L · Light'];
  const gap = lastDone() ? Math.round((pd(today) - pd(lastDone())) / DAY) : 0;
  const back = s === today && !l.done && gap >= 7 ? `<p class="note go">${gap} days since your last session. The Axiom alone counts today. Do that, tick it, and you are back in.</p>` : '';
  const fields = future ? `<p class="note">Preview. You can log this on ${DN[dow(s)]}.</p>` : !STATE.ack ? `<p class="note warn">Read the note at the top of this page to unlock logging.</p>` : `
    ${s === today ? clockBox(p) : ''}
    <div class="toggles">
      <label class="toggle"><input id="f-done" type="checkbox" data-k="done" ${l.done?'checked':''}><span>${p.test ? 'Test done' : 'Axiom done'}</span></label>
      ${p.main ? `<label class="toggle"><input id="f-main" type="checkbox" data-k="main" ${l.main?'checked':''}><span>${p.main.done}</span></label>` : ''}
    </div>
    <div class="fields">
      ${p.test ? `<div class="f"><label for="f-count">12-min count</label><input id="f-count" inputmode="numeric" maxlength="6" data-k="count" value="${esc(l.count)}" placeholder="reps"></div>` : ''}
      ${p.main ? `<div class="f"><label for="f-amt">${p.main.label}</label><input id="f-amt" inputmode="numeric" maxlength="6" data-k="amt" value="${esc(l.amt)}" placeholder="${p.main.n}"></div>` : ''}
      ${p.test ? '' : `<div class="f"><label for="f-swings">Total swings</label><input id="f-swings" inputmode="numeric" maxlength="6" data-k="swings" value="${esc(l.swings)}" placeholder="${swingsOn(s) || plannedOn(s)}"></div>`}
      <div class="f"><label for="f-rpe">Effort 1 to 10</label><input id="f-rpe" inputmode="numeric" maxlength="4" data-k="rpe" value="${esc(l.rpe)}" placeholder="1-10"></div>
      <div class="f wide"><label for="f-note">Note</label><input id="f-note" type="text" maxlength="300" data-k="note" value="${esc(l.note)}" placeholder="${p.t==='A' ? 'Press and split squat reps, how it felt' : 'How it felt'}"></div>
    </div>`;
  return `<div class="card ${l.done?'done':''}">
    <div class="card-top"><span class="n">${s === today ? 'Today' : DN[dow(s)]}, ${nice(s)}${l.done ? '<span class="qed" title="Counted">∎</span>' : ''}</span><span class="tag ${tag[0]}">${tag[1]}</span></div>
    <div><b>${p.title}</b></div>
    ${back}
    <ul class="moves">${p.moves.map(m => `<li class="${m[0]}"><span>${m[1]}</span><span>${m[2]}</span></li>`).join('')}</ul>
    <p class="note">${p.tip}</p>
    ${fields}
  </div>`;
}
function renderToday(){
  if(clock.on) return;                                  // do not redraw under a running clock
  const today = todayIso(), w = wk(sel), cw = wk(today), r = weekResult(cw), L = levelAt(cw), mv = movesOn(today).length;
  const ds = wkDates(w);
  $('v-today').innerHTML = `
    ${STATE.ack ? '' : gateCard()}
    <div class="stats">
      <div class="stat ${r.c >= TARGET ? 'hit' : ''}"><div class="v">${r.c}<small> / 7</small></div><div class="l">This week, target ${TARGET}</div></div>
      <div class="stat"><div class="v">${L}<small> / 8</small></div><div class="l">Level</div></div>
      <div class="stat ${mv >= MOVE_TARGET ? 'hit' : ''}"><div class="v">${mv}<small> / ${MOVE_TARGET}</small></div><div class="l">Breaks today</div></div>
    </div>
    <div class="strip">
      <div class="strip-top"><span>Week ${w+1}, ${nice(ds[0])} to ${nice(ds[6])}</span>
        <span class="nav"><button data-wk="-1" aria-label="Previous week" ${w<=0?'disabled':''}>‹</button><button data-wk="1" aria-label="Next week" ${w>=cw?'disabled':''}>›</button></span></div>
      <div class="days7">${ds.map(d => { const p = plan(d), l = log(d), cls = [p.t, l.done?'done':'', d===today?'today':'', d===sel?'sel':'', !l.done && pd(d) < pd(today) ? 'miss':''].join(' ');
        return `<button class="d7 ${cls}" data-day="${d}" aria-label="${DN[dow(d)]} ${nice(d)}, ${p.title}${l.done?', counted':''}"><span class="dn">${DS[dow(d)]}</span><span class="ty">${l.done ? '∎' : p.test ? 'T' : p.t}</span></button>`; }).join('')}</div>
      <div class="key"><span><b class="a">A</b> strength</span><span><b class="b">B</b> density</span><span><b>L</b> light, on walk days</span><span><b>∎</b> counted</span></div>
    </div>
    ${dayCard(sel)}`;
}
function idleBox(){
  const last = lastMoved(), ms = last ? Date.now() - last : 0, h = new Date().getHours();
  if(!last) return `<div class="idle"><div class="t">No log yet</div><div class="m">Log a break or a session and the clock starts.</div></div>`;
  const cls = ms < 60*60000 ? 'ok' : ms < 120*60000 ? 'mid' : 'late';
  const msg = cls === 'ok' ? 'You moved within the hour.' : cls === 'mid' ? 'Over an hour. A two-minute break is due.' : (h >= 22 || h < 7) ? 'Counting from your last log. It can wait until morning.' : 'More than two hours. Get up now and take the next one.';
  return `<div class="idle ${cls}"><div class="t">${span(ms)}</div><div class="m">since you last moved. ${msg}</div></div>`;
}
function renderMove(){
  const today = todayIso(), ms = movesOn(today), got = areasOn(today), sg = suggest();
  const week = []; for(let i = 6; i >= 0; i--){ const d = add(today,-i); week.push({d, n:movesOn(d).length}); }
  const mx = Math.max(MOVE_TARGET, ...week.map(x => x.n));
  $('v-move').innerHTML = `
    <h2>Movement breaks</h2>
    <p class="lead">Two minutes, six times a day, so no long stretch goes by sitting. Each one also works a joint the bell leaves stiff.</p>
    <div class="card">
      <div id="idle">${idleBox()}</div>
      <div class="row"><div class="dots" aria-label="${ms.length} of ${MOVE_TARGET} breaks today">${Array.from({length:MOVE_TARGET}, (_,i) => `<i class="${i < ms.length ? 'on' : ''}"></i>`).join('')}</div><span class="fine">${ms.length} of ${MOVE_TARGET} today</span></div>
      <div class="chips">${AREAS.map(a => `<span class="chip ${got.has(a)?'on':''}">${a}</span>`).join('')}</div>
    </div>
    <div class="card">
      <div class="card-top"><span class="n">Next break</span><span class="tag">${sg.area}</span></div>
      <div><b>${sg.name}</b><div class="fine">${sg.dose}</div></div>
      <div class="row"><button class="btn" data-act="move" data-id="${sg.id}">Done, log it</button>${ms.length ? `<button class="btn ghost small" data-act="unmove">Undo last</button>` : ''}</div>
    </div>
    <div class="card">
      <div><b>Or pick one</b></div>
      <div class="drills">${DRILLS.map(d => `<div class="drill"><div><div class="nm">${d.name}</div><div class="ds">${d.dose} · ${d.area}</div></div><button class="btn ghost small" data-act="move" data-id="${d.id}">Log</button></div>`).join('')}</div>
    </div>
    <div class="card">
      <div><b>Last 7 days</b></div>
      <div class="bars">${week.map(x => `<div class="bar"><span class="lb">${x.d === today ? 'Today' : DN[dow(x.d)].slice(0,3)+' '+nice(x.d)}</span><span class="tk"><i class="${x.n >= MOVE_TARGET ? 'ok' : 'act'}" style="width:${(x.n/mx*100).toFixed(1)}%"></i></span><span class="vl">${x.n} / ${MOVE_TARGET}</span></div>`).join('')}</div>
      <p class="fine">Keep every move slow and inside a range that feels easy. Skip anything that causes sharp or joint pain.</p>
    </div>`;
}
function renderPlan(){
  const L = levelAt(wk(todayIso()));
  $('v-plan').innerHTML = `
    <h2>How it runs</h2>
    <div class="rules">
      <p><b>Given:</b> one 35 lb kettlebell, with walking and food doing the fat-loss work. <b>To prove:</b> the bell gets picked up at least 5 days a week, and the 12-minute swing count goes up.</p>
      <p><b>The Axiom:</b> 50 unbroken swings and 5 halos each way, every day. About three minutes. Once it is done the day counts, whatever else happens.</p>
      <p><b>The week:</b> A on Sunday and Thursday, B on Tuesday and Saturday, Axiom only on Monday, Wednesday and Friday so nothing stacks on walk and dumbbell days.</p>
      <p><b>No catching up:</b> the session is whatever today is. A missed day stays missed. Five counted days is a full week.</p>
      <p><b>Levels:</b> finish a week with 4 or more counted days and at least one B block, and next week moves up a level. A partial week repeats the level. A week with nothing drops one.</p>
      <p><b>A good swing:</b> hinge at the hips, bell to chest height, hips and knees locked at the top. Count only those. Clear the space in front of you first.</p>
      <p><b>Stop rules:</b> end the set when your lower back takes over from your hips, or your grip starts to slip. Chest pain, dizziness or breathlessness that feels wrong means stop for the day and get it checked.</p>
    </div>
    <h2>The eight levels</h2>
    <div class="tbl">
      <div class="tr"><span>Level</span><span>A · rounds</span><span>B · block</span></div>
      ${[1,2,3,4,5,6,7,8].map(n => { const k = n-1; return `<div class="tr ${n===L?'cur':n<L?'past':''}"><span>${n}</span><span>${AR[k]} × press ${AP[k]}, split ${AS[k]}</span><span>${n===8 ? '10 min × 15, then the 12-minute retest' : BMIN[k]+' min × '+(BONE[k] ? (BPER[k]/2)+' / arm' : BPER[k])}${n===1 ? ', then the baseline' : ''}</span></div>`; }).join('')}
    </div>
    <p class="fine">Level 7 is the pace of the study this is measured against: 22 swings a minute for 12 minutes. The bell stays at 35 lb, so the work gets harder by packing more swings into each minute and by going one-arm. After level 8 the next step is a 53 lb bell.</p>`;
}
function bar(label, val, max, cls, text){ return `<div class="bar"><span class="lb">${label}</span><span class="tk"><i class="${cls}" style="width:${Math.max(0, Math.min(100, max ? val/max*100 : 0)).toFixed(1)}%"></i></span><span class="vl">${text}</span></div>`; }
function renderProof(){
  const today = todayIso(), cw = wk(today), st = streak();
  const days = []; for(let d = today, i = 0; i < 14 && pd(d) >= pd(STATE.start); i++, d = add(d,-1)) days.push(d);
  const shown = days.filter(d => log(d).done).length;
  const weeks = []; for(let w = Math.max(0, cw-7); w <= cw; w++){ const ds = wkDates(w); weeks.push({w, act: ds.reduce((a,d) => a + swingsOn(d), 0), plan: ds.reduce((a,d) => a + plannedOn(d), 0), c: weekResult(w).c}); }
  const maxS = Math.max(1, ...weeks.map(x => Math.max(x.act, x.plan)));
  const total = Object.keys(STATE.days).reduce((a,d) => a + swingsOn(d), 0), cur = weeks[weeks.length-1];
  const base = findTest('base'), fin = findTest('final'), bc = base ? num(log(base).count) : 0, fc = fin ? num(log(fin).count) : 0, maxT = Math.max(STUDY, bc, fc);
  const mv7 = Array.from({length:7}, (_,i) => movesOn(add(today,-i)).length).reduce((a,b) => a+b, 0);
  $('v-proof').innerHTML = `
    <h2>Showing up</h2>
    <div class="stats">
      <div class="stat ${days.length && shown/days.length >= 5/7 ? 'hit' : ''}"><div class="v">${shown}<small> / ${days.length}</small></div><div class="l">Last ${days.length} day${days.length===1?'':'s'}</div></div>
      <div class="stat"><div class="v">${st}<small> day${st===1?'':'s'}</small></div><div class="l">Streak</div></div>
      <div class="stat"><div class="v">${mv7}<small> / ${MOVE_TARGET*7}</small></div><div class="l">Breaks, 7 days</div></div>
    </div>
    <div class="card">
      <div><b>Swings per week</b></div>
      <div class="bars">${weeks.map(x => `<div class="bar"><span class="lb">Wk ${x.w+1}, ${x.c}/7</span><span class="tk"><i class="plan" style="width:${(x.plan/maxS*100).toFixed(1)}%"></i><i class="act" style="width:${(x.act/maxS*100).toFixed(1)}%"></i></span><span class="vl">${x.act} / ${x.plan}</span></div>`).join('')}</div>
      <p class="fine">Yellow is logged, grey is the full plan for that week's level. ${total.toLocaleString()} swings logged in all. This week's swings come to about ${Math.round(cur.act*KCAL)} kcal, a low estimate.</p>
    </div>
    <div class="card">
      <div><b>12-minute swing count</b></div>
      <div class="bars">
        ${bar('Baseline', bc, maxT, 'act', bc ? bc : 'not yet')}
        ${bar('Retest', fc, maxT, 'ok', fc ? fc : 'level 8')}
        ${bar('Study avg', STUDY, maxT, 'ref', STUDY)}
      </div>
      <p class="fine">The study average comes from ten fit college-aged men using the same 16 kg bell. It is a yardstick, not a pass mark. Your own baseline is the number to beat.</p>
    </div>
    <h2>Why it is built this way</h2>
    <ul class="plain">
      <li>Swings in dense timed blocks reach a real cardio load. Short sets with long rests do not.</li>
      <li>At the same effort, a treadmill uses more oxygen than swings, so walking stays the main cardio.</li>
      <li>Lifting through a diet keeps muscle while fat comes off.</li>
      <li>Breaking up long sitting with a few minutes of light movement lowers blood sugar and blood pressure through the day.</li>
      <li>A plan people keep beats a better plan they drop, so a three-minute day counts.</li>
    </ul>
    <h2>Sources</h2>
    <ol class="src">
      <li><a rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/20300022/">Farrar 2010</a>: oxygen cost of 12 minutes of swings.</li>
      <li><a rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/22395274/">Hulsey 2012</a>: swings against treadmill running.</li>
      <li><a rel="noopener noreferrer" href="https://ro.ecu.edu.au/ecuworks2022-2026/1500">Lopez 2022</a>: resistance training, fat and lean mass.</li>
      <li><a rel="noopener noreferrer" href="https://sedentarybehaviour.org/2023/05/31/breaking-up-prolonged-sitting-to-improve-cardiometabolic-risk-dose-response-analysis-of-a-randomized-crossover-trial">Duran 2023</a>: walking breaks during long sitting.</li>
      <li><a rel="noopener noreferrer" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12784378/">Adherence review 2026</a>: what keeps people training.</li>
      <li><a rel="noopener noreferrer" href="https://www.ncbi.nlm.nih.gov/m/pubmed/21997449/">McGill and Marshall 2012</a>: how the swing loads the lower back.</li>
    </ol>`;
}
function renderSetup(){
  const standalone = matchMedia('(display-mode: standalone)').matches;
  const n = Object.keys(STATE.days).length, m = Object.values(STATE.moves).reduce((a,x) => a + x.length, 0);
  $('v-setup').innerHTML = `
    <h2>Install</h2>
    <div class="card">${standalone ? `<p class="lead"><b>Installed.</b> This is running as its own app and works with no signal.</p>` : `
      <p class="lead">In Chrome, open the <b>⋮</b> menu and choose <b>Add to Home screen</b>, then <b>Install</b>. After that it opens from your home screen and works with no signal.</p>`}</div>
    <h2>Reminders</h2>
    <div class="card">
      <div class="alarms">${ALARMS.map(a => `<div><span>${a[0]}</span><span>${a[1]}</span></div>`).join('')}</div>
      <p class="fine">These are alarms in your phone's Clock app. A web app cannot ring while it is closed, so the phone does the ringing and this app does the logging. Change or turn them off in Clock.</p>
    </div>
    <h2>Your data</h2>
    <div class="card">
      <ul class="plain">
        <li>Logs are stored only in this browser on this phone. Nothing is uploaded and there are no accounts, ads or trackers.</li>
        <li>The app loads no outside code, and its security policy blocks it from contacting any other site.</li>
        <li>Clearing Chrome's site data or uninstalling deletes the logs, so export a backup now and then.</li>
      </ul>
      <p class="fine">${n} day${n===1?'':'s'} and ${m} break${m===1?'':'s'} stored. ${storageOK ? '' : 'Storage is blocked in this browser, so nothing will be kept.'}</p>
      <div class="row"><button class="btn small" data-act="export">Export backup</button><button class="btn small ghost" data-act="import">Import backup</button><input id="imp" type="file" accept="application/json,.json" hidden></div>
    </div>
    <h2>Reset</h2>
    <div class="card">
      <div class="row">
        <button class="btn small ghost" data-act="restart">${armed === 'restart' ? 'Tap again to restart at level 1 this week' : 'Restart the block this week'}</button>
        <button class="btn small ${armed === 'erase' ? 'danger' : 'ghost'}" data-act="erase">${armed === 'erase' ? 'Tap again to erase everything' : 'Erase all data'}</button>
      </div>
      <p class="fine">Restart clears logs from earlier weeks. Export a backup first if you want to keep them.</p>
    </div>`;
}
function renderAll(){
  const t = todayIso();
  $('sub').textContent = 'week ' + (wk(t)+1) + ' · level ' + levelAt(wk(t)) + ' of 8';
  renderToday(); renderMove(); renderPlan(); renderProof(); renderSetup();
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'v-'+tab));
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
}

/* ---------- block clock: buzzes at the top of each minute ---------- */
const clock = {on:false, start:0, min:0, per:0, last:-1, timer:0, lock:null, ctx:null};
function beep(long){
  try{ if(navigator.vibrate) navigator.vibrate(long ? [400,150,400] : 250); }catch(e){}
  try{ const c = clock.ctx; if(!c) return; const o = c.createOscillator(), g = c.createGain(); o.frequency.value = long ? 660 : 880; g.gain.value = .2; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + (long ? .8 : .2)); }catch(e){}
}
async function clockStart(min, per){
  clockStop(true);
  Object.assign(clock, {on:true, start:Date.now(), min, per, last:-1});
  try{ clock.ctx = clock.ctx || new (window.AudioContext || window.webkitAudioContext)(); await clock.ctx.resume(); }catch(e){}
  try{ clock.lock = await navigator.wakeLock.request('screen'); }catch(e){ clock.lock = null; }
  clock.timer = setInterval(clockTick, 250); clockTick();
}
function clockTick(){
  const tEl = $('clock-t'), mEl = $('clock-m'); if(!clock.on || !tEl) return clockStop(true);
  const el = Date.now() - clock.start, total = clock.min*60000;
  if(el >= total){ tEl.textContent = '00:00'; mEl.textContent = 'Time. Park the bell and log it.'; beep(true); return clockStop(false); }
  const left = Math.ceil((total - el)/1000), minute = Math.floor(el/60000);
  tEl.textContent = String(Math.floor(left/60)).padStart(2,'0') + ':' + String(left%60).padStart(2,'0');
  mEl.textContent = 'Minute ' + (minute+1) + ' of ' + clock.min + (clock.per ? ': ' + clock.per + ' swings, then rest.' : '. Count every rep.');
  if(minute !== clock.last){ clock.last = minute; beep(false); }
}
function clockStop(redraw){
  clearInterval(clock.timer); clock.on = false;
  try{ if(clock.lock) clock.lock.release(); }catch(e){} clock.lock = null;
  if(redraw) renderToday();
}

/* ---------- backup ---------- */
function exportData(){
  const text = JSON.stringify(STATE, null, 1);
  try{
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type:'application/json'}));
    a.download = 'kb-theorem-backup-' + todayIso() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000); say('Backup saved to your Downloads.');
  }catch(e){ say("Couldn't create the backup file.", true); }
}
function importData(file){
  if(!file || file.size > 2e6) return say('That file is too large to be a backup.', true);
  const r = new FileReader();
  r.onload = () => { try{ const o = JSON.parse(String(r.result)); if(!o || typeof o.days !== 'object') throw 0; STATE = clean(o); save(); sel = todayIso(); renderAll(); say('Backup restored.'); }catch(e){ say('That file is not a KB Theorem backup.', true); } };
  r.onerror = () => say("Couldn't read that file.", true);
  r.readAsText(file);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-day],[data-wk],[data-act]'); if(!t || t.disabled) return;
  const act = t.dataset.act;
  if(act !== 'restart' && act !== 'erase' && armed){ armed = ''; }
  if(t.dataset.tab){ if(clock.on) clockStop(false); tab = t.dataset.tab; try{ sessionStorage.setItem('kbt-tab', tab); }catch(err){} renderAll(); window.scrollTo(0,0); return; }
  if(t.dataset.day){ if(clock.on) clockStop(false); sel = t.dataset.day; return renderToday(); }
  if(t.dataset.wk){ if(clock.on) clockStop(false); const n = add(sel, 7*(+t.dataset.wk)), today = todayIso(); sel = pd(n) < pd(STATE.start) ? STATE.start : wk(n) > wk(today) ? today : n; return renderToday(); }
  if(act === 'ack'){ STATE.ack = true; save(); return renderAll(); }
  if(act === 'clock') return clockStart(+t.dataset.min, +t.dataset.per);
  if(act === 'clock-stop') return clockStop(true);
  if(act === 'move'){ const d = todayIso(); (STATE.moves[d] = STATE.moves[d] || []).push({id:t.dataset.id, t:Date.now()}); save(); return renderAll(); }
  if(act === 'unmove'){ const d = todayIso(); if(STATE.moves[d]){ STATE.moves[d].pop(); if(!STATE.moves[d].length) delete STATE.moves[d]; } save(); return renderAll(); }
  if(act === 'export') return exportData();
  if(act === 'import') return $('imp').click();
  if(act === 'restart' || act === 'erase'){
    if(armed !== act){ armed = act; return renderSetup(); }
    armed = '';
    if(act === 'erase'){ STATE = fresh(); try{ localStorage.removeItem(KEY); }catch(err){} say('Everything erased.'); }
    else { const f = fresh(); const keep = {}; for(const d of Object.keys(STATE.days)) if(pd(d) >= pd(f.start)) keep[d] = STATE.days[d]; STATE.start = f.start; STATE.days = keep; save(); }
    sel = todayIso(); return renderAll();
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if(t.id === 'imp'){ importData(t.files && t.files[0]); t.value = ''; return; }
  const k = t.dataset.k; if(!k || !STATE.ack || pd(sel) > pd(todayIso())) return;
  const p = plan(sel), l = log(sel);
  l[k] = t.type === 'checkbox' ? t.checked : t.value.trim().slice(0, k === 'note' ? 300 : 6);
  if(k === 'main' && l.main) l.done = true;
  if(k === 'count' && num(l.count) > 0) l.done = true;
  if(l.done && !l.at && sel === todayIso()) l.at = Date.now();
  if(!l.done) l.at = 0;
  if(p.test) l.test = p.test;
  STATE.days[sel] = l;
  save();
  if(clock.on){ renderMove(); renderProof(); } else renderAll();
});
// keep the idle clock and the date current while the app is open
setInterval(() => { const el = $('idle'); if(el && tab === 'move') el.innerHTML = idleBox(); }, 30000);
let seenDay = todayIso();
document.addEventListener('visibilitychange', () => {
  if(document.hidden) return;
  if(todayIso() !== seenDay){ seenDay = todayIso(); sel = seenDay; }
  if(!clock.on) renderAll();
});

renderAll();
if(!storageOK) say('This browser is blocking storage, so logs will not be kept. Open the app in Chrome, outside private mode.', true);
try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){}
if('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
