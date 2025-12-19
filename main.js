/* ---------- Data ---------- */
const data = {
  mental: {
    title: "Mental Self-Care",
    desc: "Activities that clear your mind and help you focus.",
    actions: ["Read a few pages of a book","Write down your thoughts or worries","Do 2–5 minutes of calm breathing","Try a small brain activity (puzzle, sudoku, learning one fact)","Write “3 important tasks for today”"]
  },
  physical: {
    title: "Physical Self-Care",
    desc: "Simple actions to refresh your body.",
    actions: ["Take a 15-minute walk or light exercise","Drink a full glass of water","Eat one healthy snack (fruit or nuts)","Fix your sitting posture","Take a short rest or power nap (15–20 minutes)"]
  },
  emotional: {
    title: "Emotional Self-Care",
    desc: "Ways to support your feelings with kindness.",
    actions: ["Listen to a calm or favorite song","Write one or two sentences about how you feel","Talk to a safe, supportive friend","Do a small hobby you enjoy","Tell yourself one kind sentence (“It’s okay to rest…”)"]
  },
  social: {
    title: "Social Self-Care",
    desc: "Healthy connections that help you feel supported.",
    actions: ["Set a simple, healthy boundary","Limit contact with negative or toxic people","Have one small positive interaction (hello, smile)","Send a kind message to someone","Use social media in a positive, gentle way"]
  },
  spiritual: {
    title: "Spiritual Self-Care",
    desc: "Reconnect with meaning, hope and inner peace.",
    actions: ["Spend a moment in nature","Pray or write a short gratitude note","Do a small act of kindness","Write your intention for today","Take one minute of quiet to reset"]
  },
  suggestions: [
    "Take 5 slow deep breaths.",
    "Walk 10 minutes without your phone.",
    "Drink a tall glass of water + stretch neck/shoulders.",
    "Write 3 small good things that happened today.",
    "Listen to one uplifting song.",
    "Read 3 short pages or a poem.",
    "Send a friendly message to someone.",
    "Stand by a window and look outside for 2 minutes.",
    "Doodle for 5 minutes — no judgment.",
    "Write: 'I did my best today' and keep it."
  ],
  moodMessages: {
    happy: "Nice — hold this moment and share a smile if you can.",
    good: "Good — keep one small habit that helps.",
    okay: "That's okay — try a short pause or breath.",
    tired: "Rest is allowed — a short break can help.",
    sad: "You are seen — consider talking to someone you trust."
  }
};

/* ---------- Helpers (localStorage) ---------- */
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function load(key, fallback){ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }

/* ---------- Wheel interactions ---------- */
const legendItems = document.querySelectorAll('.legend-item');
const wheelDetail = document.getElementById('wheelDetail');
const wheel = document.getElementById('wheel');

function showDetail(type){
  const info = data[type];
  wheelDetail.style.display = 'block';
  wheelDetail.innerHTML = `<strong>${info.title}</strong><p style="margin-top:8px">${info.desc}</p>
    <div style="margin-top:8px"><em>Try one:</em><ul style="margin:6px 0 0 16px">${info.actions.map(a=>`<li>${a}</li>`).join('')}</ul></div>`;
  wheelDetail.scrollIntoView({behavior:'smooth', block:'center'});
}

legendItems.forEach(el=>{
  el.addEventListener('mouseenter', ()=> el.classList.add('hover'));
  el.addEventListener('mouseleave', ()=> el.classList.remove('hover'));
  el.addEventListener('click', ()=> {
    const t = el.dataset.type;
    showDetail(t);
  });
});

// overlay labels on wheel
const wheelLabels = document.querySelectorAll('.wheel-label');
wheelLabels.forEach(lbl=>{
  lbl.addEventListener('click', ()=> showDetail(lbl.dataset.type));
});

// allow clicking center to random open a section
document.getElementById('wheelCenter').addEventListener('click', ()=>{
  const keys = ['mental','physical','emotional','social','spiritual'];
  const pick = keys[Math.floor(Math.random()*keys.length)];
  showDetail(pick);
});

/* ---------- Suggestion generator ---------- */
const suggestText = document.getElementById('suggestText');
const suggestHistoryEl = document.getElementById('suggestHistory');
let history = load('bc_suggestions') || [];

function renderSuggestHistory(){
  if(!history.length){ suggestHistoryEl.textContent = 'No recent suggestions.'; return; }
  suggestHistoryEl.innerHTML = history.slice(0,6).map(h=>`<div style="margin-bottom:6px">• ${h.text}</div>`).join('');
}
renderSuggestHistory();

document.getElementById('getOne').addEventListener('click', ()=>{
  const s = data.suggestions[Math.floor(Math.random()*data.suggestions.length)];
  suggestText.textContent = s;
  history.unshift({text:s, time:new Date().toISOString()});
  if(history.length>10) history.length = 10;
  save('bc_suggestions', history);
  renderSuggestHistory();
});

document.getElementById('clearSuggestions').addEventListener('click', ()=>{
  if(confirm('Clear suggestion history?')){ history=[]; save('bc_suggestions', history); renderSuggestHistory(); suggestText.textContent='Press Get one for a small action.';}
});

/* ---------- Checklist logic ---------- */
const checkInputs = document.querySelectorAll('#checklist input[type="checkbox"]');
const saveCheckBtn = document.getElementById('saveCheck');
const printCheckBtn = document.getElementById('printCheck');
const checkMsg = document.getElementById('checkMsg');

function readChecks(){
  const s = {};
  checkInputs.forEach(i=> s[i.dataset.key] = i.checked);
  return s;
}
function writeChecks(state){
  checkInputs.forEach(i=> i.checked = !!state[i.dataset.key]);
}
writeChecks(load('bc_checklist') || {});

saveCheckBtn.addEventListener('click', ()=>{
  save('bc_checklist', readChecks());
  checkMsg.textContent = 'Checklist saved locally. You can print or come back later.';
  setTimeout(()=> checkMsg.textContent = '', 3000);
});
printCheckBtn.addEventListener('click', ()=> window.print());

/* ---------- Mood tracker ---------- */
const moodBtns = document.querySelectorAll('.mood-btn');
const moodHistoryEl = document.getElementById('moodHistory');
const moodMsgEl = document.getElementById('moodMsg');
let moods = load('bc_moods') || [];

function renderMoods(){
  moodHistoryEl.innerHTML = '';
  moods.slice(0,10).forEach(m=>{
    const d = document.createElement('div');
    d.style.display='flex';d.style.alignItems='center';d.style.gap='8px';d.style.marginBottom='6px';
    const dot = document.createElement('div'); dot.className='mood-dot';
    dot.style.background = moodColor(m.mood);
    d.appendChild(dot);
    const txt = document.createElement('div'); txt.className='small';
    txt.textContent = `${m.emoji} ${m.mood}`;
    d.appendChild(txt);
    moodHistoryEl.appendChild(d);
  });
}
function moodColor(m){
  switch(m){
    case 'happy': return '#FEE8F0';
    case 'good': return '#FFF0E0';
    case 'okay': return '#FFF7F2';
    case 'tired': return '#FFF6F6';
    case 'sad': return '#F1ECEF';
    default: return '#EEE';
  }
}
renderMoods();

moodBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    moodBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const mood = btn.dataset.mood;
    const emoji = btn.textContent;
    const entry = {mood, emoji, time: new Date().toISOString()};
    moods.unshift(entry);
    if(moods.length>30) moods.length=30;
    save('bc_moods', moods);
    renderMoods();
    moodMsgEl.textContent = data.moodMessages[mood] || '';
    setTimeout(()=> { if(moodMsgEl.textContent === data.moodMessages[mood]) moodMsgEl.textContent = ''; }, 4500);
  });
});

// clear mood history button
document.getElementById('clearMoodHistory').addEventListener('click', ()=>{
  if(confirm('Clear mood history on this device?')){
    moods = [];
    save('bc_moods', moods);
    renderMoods();
    moodMsgEl.textContent = 'Mood history cleared.';
    setTimeout(()=> moodMsgEl.textContent = '', 2200);
  }
});

/* ---------- Feedback ---------- */
const fbA = document.getElementById('fbA'), fbB = document.getElementById('fbB'), fbC = document.getElementById('fbC');
const fbMsg = document.getElementById('fbMsg');
document.getElementById('sendFb').addEventListener('click', ()=>{
  if(fbB.value === '-- choose --'){ fbMsg.textContent = 'Please choose whether you felt better or not.'; return; }
  const arr = load('bc_feedback') || [];
  arr.unshift({a:fbA.value||'—', b:fbB.value, c:fbC.value||'—', time:new Date().toISOString()});
  if(arr.length>50) arr.length=50;
  save('bc_feedback', arr);
  fbMsg.textContent = 'Thank you — your feedback is saved locally.';
  fbA.value = ''; fbB.value='-- choose --'; fbC.value='';
  setTimeout(()=> fbMsg.textContent='', 2500);
});
document.getElementById('clearFb').addEventListener('click', ()=>{
  if(confirm('Clear saved feedback on this device?')){ save('bc_feedback', []); fbMsg.textContent='Feedback cleared.'; setTimeout(()=> fbMsg.textContent='', 2000); }
});

/* ---------- initialize: show a gentle suggestion ---------- */
window.addEventListener('load', ()=>{
  const hist = load('bc_suggestions')||[];
  if(hist.length) suggestText.textContent = hist[0].text;
  else suggestText.textContent = "Tip: press Get one — start with 5 slow deep breaths.";
  renderSuggestHistory();
  renderMoods();
});
