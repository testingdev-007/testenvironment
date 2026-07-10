/* ════════════════════════════════════════════════════════════
   CYBERSHIELD: ANALYST EDITION — gamification_alevel.js
   Analyst grades, trophies, performance report end screen
   ════════════════════════════════════════════════════════════ */

var GRADES = [
  { min:0,   rank:'TRAINEE ANALYST',   tag:'TA',  stars:1, colour:'#4dc8ff', glow:'rgba(77,200,255,.5)'  },
  { min:120, rank:'JUNIOR ANALYST',    tag:'JA',  stars:2, colour:'#00ff99', glow:'rgba(0,255,153,.5)'   },
  { min:280, rank:'SECURITY ANALYST',  tag:'SA',  stars:3, colour:'#00ff41', glow:'rgba(0,255,65,.55)'   },
  { min:480, rank:'SENIOR ANALYST',    tag:'SrA', stars:4, colour:'#ffdd00', glow:'rgba(255,220,0,.55)'  },
  { min:700, rank:'LEAD ANALYST',      tag:'LA',  stars:5, colour:'#ffaa00', glow:'rgba(255,170,0,.6)'   },
  { min:960, rank:'PRINCIPAL ANALYST', tag:'PA',  stars:6, colour:'#ff5af5', glow:'rgba(255,90,245,.6)'  },
];

function getGrade(xp){
  var g=GRADES[0];
  for(var i=0;i<GRADES.length;i++){ if(xp>=GRADES[i].min) g=GRADES[i]; }
  return g;
}

var TROPHIES = [
  { id:'first_case',    icon:'🎯', name:'First Case',        desc:'Complete your first mission.' },
  { id:'perfect_round', icon:'⭐', name:'Perfect Analysis',  desc:'Every decision correct in a single mission.' },
  { id:'no_lives_lost', icon:'🛡️', name:'Unscathed',         desc:'Complete a full session without a single error.' },
  { id:'quiz_ace',      icon:'🧠', name:'Quiz Ace',          desc:'Every debrief quiz question correct in a session.' },
  { id:'sql_guardian',  icon:'🔐', name:'SQL Guardian',      desc:'Perfect triage of SQL injection — including the edge cases.' },
  { id:'crypto_auditor',icon:'🔑', name:'Crypto Auditor',    desc:'Every cryptographic configuration correctly classified.' },
  { id:'net_shield',    icon:'📡', name:'Net Shield',        desc:'Every network flow in a packet analysis mission correctly triaged.' },
  { id:'law_expert',    icon:'⚖️', name:'Law Expert',        desc:'Every legal incident correctly classified — no wrong referrals.' },
  { id:'fw_architect',  icon:'🧱', name:'Firewall Architect', desc:'Every firewall change request correctly approved, escalated or rejected.' },
  { id:'social_sense',  icon:'🎭', name:'Social Sense',      desc:'Every social engineering attempt correctly identified.' },
  { id:'endpoint_hunter',icon:'🔍',name:'Endpoint Hunter',   desc:'Every malware process correctly identified and actioned.' },
];

// Topic-to-module mapping for the performance report
var TOPIC_MAP = {
  packetAnalysis:  { label:'Networks & TCP/IP',       icon:'📡' },
  encryptionAudit: { label:'Encryption & Hashing',    icon:'🔑' },
  sqlInjection:    { label:'Databases & SQL',          icon:'🗄️' },
  firewallReview:  { label:'Firewalls & Proxies',      icon:'🧱' },
  legalCompliance: { label:'Computing Legislation',    icon:'⚖️' },
  socialEngineering:{ label:'Social Engineering',      icon:'🎭' },
  malwareAnalysis: { label:'Malware & Threats',        icon:'🔍' },
};

var GAMIFICATION = {
  runNumber: 0,
  runHistory: [],
  trophiesEarned: new Set(),
  _sessionResults: [],
};

function recordModuleResult(modId, scenario, xpDelta){
  if(!GAMIFICATION._sessionResults) GAMIFICATION._sessionResults = [];
  var correct = 0, total = 0;
  if(scenario) scenario.forEach(function(s){
    total++;
    if(s.userAction === s.actionAnswer) correct++;
  });
  GAMIFICATION._sessionResults.push({
    modId: modId,
    scenario: scenario,
    xpDelta: xpDelta,
    correct: correct,
    total: total,
    pct: total > 0 ? Math.round(correct/total*100) : 0,
  });
}

function checkTrophies(){
  var newly = [];
  function award(id){ if(!GAMIFICATION.trophiesEarned.has(id)){ GAMIFICATION.trophiesEarned.add(id); newly.push(id); } }
  if(GAMIFICATION.runNumber === 1) award('first_case');
  if(GS.livesLost === 0) award('no_lives_lost');
  if(GS.quizTotal > 0 && GS.quizCorrect === GS.quizTotal) award('quiz_ace');
  var results = GAMIFICATION._sessionResults || [];
  results.forEach(function(r){
    var all = r.pct === 100 && r.total >= 4;
    if(all) award('perfect_round');
    if(r.modId==='sqlInjection'     && all) award('sql_guardian');
    if(r.modId==='encryptionAudit'  && all) award('crypto_auditor');
    if(r.modId==='packetAnalysis'   && all) award('net_shield');
    if(r.modId==='legalCompliance'  && all) award('law_expert');
    if(r.modId==='firewallReview'   && all) award('fw_architect');
    if(r.modId==='socialEngineering'&& all) award('social_sense');
    if(r.modId==='malwareAnalysis'  && all) award('endpoint_hunter');
  });
  return newly;
}

function esTab(name){
  ['report','trophies','history'].forEach(function(t){
    var tab=document.getElementById('esTab_'+t);
    var cont=document.getElementById('esCont_'+t);
    if(tab)  tab.classList.toggle('on', t===name);
    if(cont) cont.style.display = t===name ? '' : 'none';
  });
}

// ── PERFORMANCE REPORT ────────────────────────────────────────
function buildPerformanceReport(grade, newTrophyIds){
  var results = GAMIFICATION._sessionResults || [];
  var h = '';

  // ── Header ────────────────────────────────────────────────
  h += '<div style="text-align:center;margin-bottom:16px;">';
  h += '<div style="font-family:\'Orbitron\',monospace;font-size:10px;color:rgba(0,255,65,.4);letter-spacing:.2em;margin-bottom:4px;">TECHCORP GLOBAL — INCIDENT RESPONSE</div>';
  h += '<div style="font-family:\'Orbitron\',monospace;font-size:13px;color:rgba(0,255,65,.6);letter-spacing:.15em;">ANALYST PERFORMANCE REPORT</div>';
  h += '<div style="font-family:\'Orbitron\',monospace;font-size:9px;color:rgba(0,255,65,.3);margin-top:4px;">SESSION #'+GAMIFICATION.runNumber+' · '+new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})+'</div>';
  h += '</div>';

  // ── Grade reveal ──────────────────────────────────────────
  h += '<div style="background:rgba(0,0,0,.4);border:1px solid '+grade.colour+';border-radius:8px;padding:14px;margin-bottom:14px;text-align:center;">';
  h += '<div style="font-size:10px;color:rgba(0,255,65,.4);letter-spacing:.15em;margin-bottom:6px;">ANALYST RANK ACHIEVED</div>';
  h += '<div style="font-family:\'Orbitron\',monospace;font-size:20px;font-weight:900;color:'+grade.colour+';text-shadow:0 0 24px '+grade.glow+';">'+grade.rank+'</div>';
  // Stars
  var stars = '';
  for(var i=1;i<=6;i++) stars += '<span style="font-size:18px;color:'+(i<=grade.stars?grade.colour:'rgba(255,255,255,.1)')+';text-shadow:'+(i<=grade.stars?'0 0 8px '+grade.colour:'none')+';margin:0 1px;">★</span>';
  h += '<div style="margin-top:6px;">'+stars+'</div>';
  h += '<div style="font-size:24px;font-family:\'Orbitron\',monospace;color:var(--g);margin-top:8px;">'+GS.xp+' <span style="font-size:11px;color:rgba(0,255,65,.5);">XP</span></div>';
  h += '</div>';

  // ── Topic coverage ────────────────────────────────────────
  if(results.length > 0){
    h += '<div style="font-size:9px;letter-spacing:.15em;color:rgba(0,255,65,.4);margin-bottom:8px;">TOPICS COVERED THIS SESSION</div>';
    results.forEach(function(r){
      var topic = TOPIC_MAP[r.modId] || {label:r.modId, icon:'🔒'};
      var pct = r.pct;
      var colour = pct===100?'#00ff99':pct>=70?'#ffdd00':pct>=50?'#ffaa00':'var(--red)';
      var label = pct===100?'EXCELLENT':pct>=70?'GOOD':pct>=50?'NEEDS WORK':'REVIEW REQUIRED';
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:5px;background:rgba(0,255,65,.04);border:1px solid rgba(0,255,65,.12);border-radius:5px;">';
      h += '<div style="font-size:16px;flex-shrink:0;">'+topic.icon+'</div>';
      h += '<div style="flex:1;font-size:12px;color:rgba(0,255,65,.8);">'+topic.label+'</div>';
      h += '<div style="font-size:10px;color:'+colour+';font-family:\'Orbitron\',monospace;text-align:right;">';
      h += pct+'% &nbsp;<span style="font-size:9px;color:'+colour+';letter-spacing:.05em;">'+label+'</span>';
      h += '</div></div>';
    });
  }

  // ── Quiz performance ──────────────────────────────────────
  if(GS.quizTotal > 0){
    var qpct = Math.round(GS.quizCorrect/GS.quizTotal*100);
    var qcol = qpct===100?'#00ff99':qpct>=70?'#ffdd00':'var(--amb)';
    h += '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;margin-top:4px;background:rgba(0,245,255,.04);border:1px solid rgba(0,245,255,.15);border-radius:5px;">';
    h += '<div style="font-size:16px;">🧠</div>';
    h += '<div style="flex:1;font-size:12px;color:rgba(0,245,255,.8);">Debrief Quiz</div>';
    h += '<div style="font-size:13px;font-family:\'Orbitron\',monospace;color:'+qcol+';">'+GS.quizCorrect+'/'+GS.quizTotal+'</div>';
    h += '</div>';
  }

  // ── Revision priorities ───────────────────────────────────
  var weakAreas = results.filter(function(r){ return r.pct < 70; });
  if(weakAreas.length > 0){
    h += '<div style="margin-top:14px;padding:12px;background:rgba(255,170,0,.06);border:1px solid rgba(255,170,0,.25);border-radius:6px;">';
    h += '<div style="font-size:9px;letter-spacing:.15em;color:rgba(255,170,0,.7);margin-bottom:8px;">📌 REVISION PRIORITY</div>';
    weakAreas.forEach(function(r){
      var topic = TOPIC_MAP[r.modId] || {label:r.modId, icon:'🔒'};
      h += '<div style="font-size:11px;color:rgba(255,200,0,.8);margin-bottom:4px;">'+topic.icon+' '+topic.label+' — '+r.pct+'% accuracy in this session. Review the debrief notes and attempt again.</div>';
    });
    h += '</div>';
  }

  // ── New trophies ──────────────────────────────────────────
  if(newTrophyIds.length > 0){
    h += '<div style="margin-top:14px;">';
    h += '<div style="font-size:9px;letter-spacing:.15em;color:rgba(255,200,0,.6);margin-bottom:6px;">🏆 NEW TROPHY UNLOCKED</div>';
    newTrophyIds.forEach(function(id){
      var t = TROPHIES.find(function(x){ return x.id===id; });
      if(!t) return;
      h += '<div style="display:flex;align-items:center;gap:10px;background:rgba(255,200,0,.06);border:1px solid rgba(255,200,0,.25);border-radius:5px;padding:10px;margin-bottom:6px;">';
      h += '<div style="font-size:24px;">'+t.icon+'</div>';
      h += '<div><div style="font-family:\'Orbitron\',monospace;font-size:11px;color:#ffdd00;margin-bottom:2px;">'+t.name+'</div>';
      h += '<div style="font-size:11px;color:rgba(255,220,0,.6);">'+t.desc+'</div></div></div>';
    });
    h += '</div>';
  }

  return h;
}

function buildTrophyCabinet(){
  var h = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">';
  TROPHIES.forEach(function(t){
    var earned = GAMIFICATION.trophiesEarned.has(t.id);
    h += '<div style="background:rgba(0,255,65,'+(earned?'.07':'.02')+');border:1px solid rgba(0,255,65,'+(earned?'.3':'.08')+');border-radius:6px;padding:10px;text-align:center;opacity:'+(earned?'1':'.3')+'">';
    h += '<div style="font-size:22px;margin-bottom:5px;">'+t.icon+'</div>';
    h += '<div style="font-family:\'Orbitron\',monospace;font-size:10px;color:'+(earned?'#00ff41':'rgba(0,255,65,.4)')+';margin-bottom:3px;">'+t.name+'</div>';
    h += '<div style="font-size:10px;color:rgba(0,255,65,.5);line-height:1.4;">'+t.desc+'</div>';
    h += '</div>';
  });
  return h+'</div>';
}

function buildHistory(){
  if(!GAMIFICATION.runHistory.length) return '<div style="color:rgba(0,255,65,.3);text-align:center;padding:20px;font-size:13px;">No previous sessions this page load.</div>';
  var h = '';
  var rev = GAMIFICATION.runHistory.slice().reverse();
  rev.forEach(function(run){
    var g = getGrade(run.xp);
    h += '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;margin-bottom:5px;background:rgba(0,255,65,.04);border:1px solid rgba(0,255,65,.12);border-radius:5px;">';
    h += '<div style="font-size:10px;color:rgba(0,255,65,.35);font-family:\'Orbitron\',monospace;width:55px;">#'+run.runNum+'</div>';
    h += '<div style="font-size:11px;color:'+g.colour+';font-family:\'Orbitron\',monospace;flex:1;">'+g.rank+'</div>';
    h += '<div style="font-family:\'Orbitron\',monospace;font-size:14px;color:var(--g);">'+run.xp+' <span style="font-size:9px;color:rgba(0,255,65,.4);">XP</span></div>';
    if(run.livesLost === 0) h += '<div style="font-size:11px;">🛡️</div>';
    h += '</div>';
  });
  return h;
}

function showEndSplash(){
  GAMIFICATION.runNumber++;
  var grade = getGrade(GS.xp);
  var newTrophyIds = checkTrophies();

  GAMIFICATION.runHistory.push({
    runNum:    GAMIFICATION.runNumber,
    xp:        GS.xp,
    livesLost: GS.livesLost,
  });

  // Tab content
  var repEl = document.getElementById('esCont_results') || document.getElementById('esCont_report');
  if(repEl) repEl.innerHTML = buildPerformanceReport(grade, newTrophyIds);

  var trEl = document.getElementById('esCont_trophies');
  if(trEl) trEl.innerHTML = buildTrophyCabinet();

  var runEl = document.getElementById('esCont_runs') || document.getElementById('esCont_history');
  if(runEl) runEl.innerHTML = buildHistory();

  // Grade/XP in header elements (keep original IDs for compatibility)
  var gEl = document.getElementById('esGrade');
  if(gEl) gEl.innerHTML = '<div style="font-family:\'Orbitron\',monospace;font-size:18px;color:'+grade.colour+';text-shadow:0 0 20px '+grade.glow+';">'+grade.rank+'</div>';

  var xpEl = document.getElementById('esXPNum');
  if(xpEl) xpEl.textContent = GS.xp;

  var stEl = document.getElementById('esStars');
  if(stEl){
    var s='';
    for(var i=1;i<=6;i++) s+='<span style="font-size:20px;color:'+(i<=grade.stars?grade.colour:'rgba(255,255,255,.1)');
    stEl.innerHTML = s;
  }

  var rnEl = document.getElementById('esRunNum');
  if(rnEl) rnEl.textContent = 'SESSION #'+GAMIFICATION.runNumber;

  // Reset session data
  GAMIFICATION._sessionResults = [];

  // Show report tab first
  esTab('results');
  document.getElementById('endSplash').classList.add('open');
}
