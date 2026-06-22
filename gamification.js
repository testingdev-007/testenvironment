/* ════════════════════════════════════════════════════════════
   CYBERSHIELD ACADEMY
   FILE: gamification_2026-06-10_v1.js
   ROLE: gamification.js
   ════════════════════════════════════════════════════════════ */
// ============================================================
// GAMIFICATION.JS — CyberShield Academy v1
// Persists across resets (memory only) — clears on page reload
// ============================================================

var GAMIFICATION = {
  sessions:  [],
  trophySet: new Set(),
  totalRuns: 0,
};

// ── GRADES ───────────────────────────────────────────────────
var GRADES = [
  { min:500, name:'CYBER LEGEND',    emoji:'⭐', color:'#ffd700', stars:5 },
  { min:420, name:'CYBER HERO',      emoji:'🦸', color:'#ffaa00', stars:4 },
  { min:310, name:'CYBER AGENT',     emoji:'🕵️',  color:'#00f5ff', stars:3 },
  { min:200, name:'CYBER RANGER',    emoji:'🔵', color:'#00ff41', stars:2 },
  { min:90,  name:'CYBER APPRENTICE',emoji:'📡', color:'#aaaaaa', stars:1 },
  { min:0,   name:'CYBER ROOKIE',    emoji:'🌱', color:'#666666', stars:0 },
];

function getGrade(xp){ return GRADES.find(g => xp >= g.min) || GRADES[GRADES.length-1]; }

// ── TROPHIES ─────────────────────────────────────────────────
var TROPHIES = {
  first_mission: { name:'First Mission',    icon:'🏆', desc:'Complete your first sim' },
  iron_detective:{ name:'Iron Detective',   icon:'❤️',  desc:'Finish without losing a life' },
  top_agent:     { name:'Top Agent',        icon:'💎', desc:'Score 400+ XP in one run' },
  phish_expert:  { name:'Phishing Expert',  icon:'🎣', desc:'Catch the fake inbox email' },
  world_tracker: { name:'World Tracker',    icon:'🌍', desc:'Win the IP trace challenge' },
  hat_trick:     { name:'Hat Trick',        icon:'🎩', desc:'Complete 3 sims' },
  cyber_master:  { name:'Cyber Master',     icon:'👑', desc:'Complete 5 sims' },
  quiz_ace:      { name:'Quiz Ace',         icon:'🧠', desc:'All quiz questions correct in one run' },
  comeback:      { name:'Comeback Kid',     icon:'💪', desc:'Finish after losing 2+ lives' },
  cyber_hero:    { name:'Cyber Hero',       icon:'🦸', desc:'Achieve Cyber Hero rank' },
  perfectionist: { name:'Perfectionist',    icon:'✨', desc:'Complete a sim with all lives intact' },
};

// ── CHECK & AWARD ─────────────────────────────────────────────
function checkTrophies(sess){
  const { trophySet, totalRuns } = GAMIFICATION;
  const newT = [];
  const aw = id => { if(!trophySet.has(id)){ trophySet.add(id); newT.push(id); } };
  if(totalRuns >= 1)                                          aw('first_mission');
  if(sess.livesLost === 0)                                    aw('iron_detective');
  if(sess.finalXP >= 400)                                     aw('top_agent');
  if(sess.phishReported)                                      aw('phish_expert');
  if(sess.ipWon)                                              aw('world_tracker');
  if(totalRuns >= 3)                                          aw('hat_trick');
  if(totalRuns >= 5)                                          aw('cyber_master');
  if(sess.quizTotal > 0 && sess.quizCorrect === sess.quizTotal) aw('quiz_ace');
  if(sess.livesLost >= 2)                                     aw('comeback');
  if(sess.finalXP >= 420)                                     aw('cyber_hero');
  if(sess.heartsLeft >= 3)                                    aw('perfectionist');
  return newT;
}

function recordSession(data){
  GAMIFICATION.totalRuns++;
  GAMIFICATION.sessions.push({ run: GAMIFICATION.totalRuns, ...data, grade: getGrade(data.finalXP) });
  return checkTrophies(data);
}

// ── SHOW END SPLASH ───────────────────────────────────────────
function showEndSplash(){
  const livesBonus = GS.hearts * 20;
  const finalXP    = GS.xp + livesBonus;
  const sess = {
    xp: GS.xp, livesBonus, finalXP,
    heartsLeft: GS.hearts,          livesLost: GS.livesLost || 0,
    quizCorrect: GS.quizCorrect || 0, quizTotal: GS.quizTotal || 0,
    phishReported: GS.phishReported || false,
    ipWon: GS.ipWon || false,
    rounds: GS.round,
  };
  const newTrophies = recordSession(sess);
  const grade = getGrade(finalXP);

  // Grade badge
  document.getElementById('esGrade').innerHTML =
    `<div class="es-emoji">${grade.emoji}</div>
     <div class="es-gname" style="color:${grade.color};text-shadow:0 0 20px ${grade.color}80">${grade.name}</div>`;

  // Animated XP counter
  const xpEl = document.getElementById('esXPNum');
  let cur = 0;
  const step = Math.max(1, Math.ceil(finalXP / 60));
  const ti = setInterval(() => { cur = Math.min(cur + step, finalXP); xpEl.textContent = cur; if(cur >= finalXP) clearInterval(ti); }, 22);
  document.getElementById('esXPBreak').textContent =
    livesBonus > 0 ? `${sess.xp} mission XP  +  ${livesBonus} lives bonus` : '';

  // Stars
  document.getElementById('esStars').innerHTML =
    Array(5).fill(0).map((_,i) => `<span class="${i < grade.stars ? 's-on':'s-off'}">★</span>`).join('');

  // Run tag
  document.getElementById('esRunNum').textContent = `RUN #${GAMIFICATION.totalRuns}`;

  // New trophies banner
  const ntEl = document.getElementById('esNewTrophies');
  if(newTrophies.length){
    ntEl.innerHTML = '<div class="es-nt-lbl">UNLOCKED THIS RUN!</div><div class="es-nt-row">' +
      newTrophies.map(id =>
        `<div class="es-nt-badge">${TROPHIES[id].icon}<div>${TROPHIES[id].name}</div></div>`
      ).join('') + '</div>';
    ntEl.style.display = 'block';
  } else {
    ntEl.style.display = 'none';
  }

  _buildResults(sess, grade);
  _buildTrophies(newTrophies);
  _buildRuns();
  esTab('results');
  document.getElementById('endSplash').classList.add('open');
}

// ── TABS ─────────────────────────────────────────────────────
function esTab(name){
  ['results','trophies','runs'].forEach(t => {
    document.getElementById('esTab_' + t).classList.toggle('on', t === name);
    document.getElementById('esCont_' + t).style.display = (t === name) ? 'block' : 'none';
  });
}

// ── RESULTS TAB ───────────────────────────────────────────────
function _buildResults(sess, grade){
  document.getElementById('esCont_results').innerHTML = `
    <div class="es-stat-grid">
      <div class="es-stat"><div class="es-sn" style="color:${grade.color}">${sess.finalXP}</div><div class="es-sl">TOTAL XP</div></div>
      <div class="es-stat"><div class="es-sn" style="color:var(--g)">${sess.heartsLeft}</div><div class="es-sl">LIVES LEFT</div></div>
      <div class="es-stat"><div class="es-sn" style="color:var(--cyn)">${sess.quizCorrect}/${sess.quizTotal}</div><div class="es-sl">QUIZ</div></div>
      <div class="es-stat"><div class="es-sn" style="color:var(--amb)">${sess.rounds}</div><div class="es-sl">MISSIONS</div></div>
    </div>
    <div class="es-break">
      <div class="es-brow"><span>Mission XP</span><span>${sess.xp}</span></div>
      ${sess.livesBonus > 0 ? `<div class="es-brow"><span>Lives bonus (${sess.heartsLeft} × 20)</span><span>+${sess.livesBonus}</span></div>` : ''}
      ${sess.quizCorrect > 0 ? `<div class="es-brow"><span>Quiz bonus (${sess.quizCorrect} × 15)</span><span>+${sess.quizCorrect * 15}</span></div>` : ''}
      <div class="es-brow es-brow-tot"><span>FINAL SCORE</span><span style="color:${grade.color}">${sess.finalXP}</span></div>
    </div>
    <div class="es-badges">
      ${sess.phishReported ? '<span class="es-badge">🎣 Caught fake email!</span>' : ''}
      ${sess.ipWon         ? '<span class="es-badge">🌍 IP traced!</span>'        : ''}
      ${sess.livesLost === 0 ? '<span class="es-badge">❤️ Perfect lives!</span>'  : ''}
    </div>`;
}

// ── TROPHY CABINET ────────────────────────────────────────────
function _buildTrophies(newTrophies){
  const earned = GAMIFICATION.trophySet;
  const ids = Object.keys(TROPHIES);
  document.getElementById('esCont_trophies').innerHTML =
    `<div class="es-trophy-count">${earned.size} / ${ids.length} trophies</div>
     <div class="es-trophy-grid">` +
    ids.map(id => {
      const t = TROPHIES[id];
      const got = earned.has(id);
      const isNew = newTrophies.includes(id);
      return `<div class="es-tcell ${got?'got':''} ${isNew?'new':''}">
        <div class="es-ticon">${got ? t.icon : '🔒'}</div>
        <div class="es-tname">${got ? t.name : '???'}</div>
        <div class="es-tdesc">${got ? t.desc : 'Keep playing!'}</div>
        ${isNew ? '<div class="es-tnew">NEW!</div>' : ''}
      </div>`;
    }).join('') + `</div>`;
}

// ── RUN HISTORY ───────────────────────────────────────────────
function _buildRuns(){
  const sessions = GAMIFICATION.sessions;
  if(!sessions.length){
    document.getElementById('esCont_runs').innerHTML = '<div class="es-empty">No history yet!</div>';
    return;
  }
  const sorted  = [...sessions].sort((a,b) => b.finalXP - a.finalXP);
  const current = GAMIFICATION.totalRuns;
  document.getElementById('esCont_runs').innerHTML =
    `<div class="es-run-grid">
       <div class="es-rh"><span>RUN</span><span>RANK</span><span>XP</span><span>LIVES</span><span>QUIZ</span></div>` +
    sorted.map((s,i) =>
      `<div class="es-rrow ${s.run===current?'cur':''} ${i===0?'best':''}">
        <span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':''}#${s.run}</span>
        <span>${s.grade.emoji} ${s.grade.name.replace('CYBER ','')}</span>
        <span style="color:${s.grade.color};font-weight:bold">${s.finalXP}</span>
        <span>${'❤'.repeat(s.heartsLeft)}${'🖤'.repeat(3-s.heartsLeft)}</span>
        <span>${s.quizCorrect}/${s.quizTotal}</span>
      </div>`
    ).join('') + `</div>`;
}
