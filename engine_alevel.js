/* ════════════════════════════════════════════════════════════
   CYBERSHIELD ACADEMY
   FILE: engine_2026-06-10_v29.js
   ROLE: engine.js
   ════════════════════════════════════════════════════════════ */
// ============================================================
// ENGINE.JS  —  CyberShield Academy  v6
// ============================================================
// KEY CHANGES v6:
//  - Exceptions don't count against the round total
//  - Globe: slow idle spin, new hop auto-rotates to RIGHT EDGE
//    so city drifts left across visible face (readable for ~4s)
//  - New RAG flow: ONE overall severity question per scenario
//    (asked once when tool loads correctly), then per-row
//    the student just picks the ACTION (no redundant RAG repeat)
//  - Data rows are cards — all info visible, no truncation


// ── SESSION HISTORY — persists across resets, clears on page reload ──
var SESSION_HISTORY = {
  recentMods: [],  // ordered oldest→newest; drives anti-repetition
  modulesUsed: new Set(),      // module IDs shown this page load
  quizShown:   {},             // { moduleId: Set of question indices shown }
  scenarioKeys: new Set(),     // 'modId_numEsc_type' — avoid identical patterns
};

// ── UTILITIES ────────────────────────────────────────────────
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

// ── CHAT ─────────────────────────────────────────────────────
function gcMsg(pId,msg,delay=0){
  const p=PERSONAS[pId];if(!p||!msg)return;
  setTimeout(()=>{
    const now=new Date();
    const t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    const w=document.createElement('div');w.className='cmsg p'+pId;
    w.innerHTML='<div class="chdr"><span class="cname">'+esc(p.name)+'</span><span class="ctime">'+t+'</span></div><div class="cbub">'+esc(msg)+'</div>';
    const box=document.getElementById('chatMsgs');
    if(box){box.appendChild(w);box.scrollTop=box.scrollHeight;}
    try{SFX.chatPing();}catch(e){}
  },delay);
}

function gcMod(modId,event,delay=0){
  try{
    // Module-specific pool first, then global fallback
    var pool=(MODULE_GROUP_CHAT[modId]||{})[event]||(GLOBAL_CHAT[event]||[]);
    if(!pool.length)return;
    var e=pick(pool);if(!e)return;
    gcMsg(e.persona,pick(e.msgs),delay);
  }catch(err){}
}

function gcModLoad(modId){
  try{
    var chat=MODULE_GROUP_CHAT[modId]||{};
    var l1=chat.onLoad_1||[],l2=chat.onLoad_2||[];
    if(l1.length){var e=pick(l1);gcMsg(e.persona,pick(e.msgs),400);}
    if(l2.length){var e2=pick(l2);gcMsg(e2.persona,pick(e2.msgs),2500);}
  }catch(err){}
}


// ── TOOL ICONS ───────────────────────────────────────────────
var TOOL_ICONS={
  'Packet Capture Analyser':'📡',
  'Encryption Audit Tool':'🔐',
  'SQL Query Log Viewer':'🗄',
  'Firewall Rule Manager':'🛡',
  'Legal Reference Database':'⚖',
  'Social Engineering Alert Triage':'🎭',
  'Endpoint Detection Log Viewer':'💻',
};

var GS = {
  maxH:3, hearts:3, xp:0,
  round:0, totalRounds:4,
  modId:null, scenario:null,
  correctTool:null, toolOk:false,
  reportReady:false,
  active:false,
  phishDone:false, ipDone:false, difficulty:1, preBriefDone:new Set(),
  queue:[], forceMod:null,
  badTools:0,
  sessId:uid(),
  scenarioRagDone:true,
  ip:{},
  gfr:null,
  autoTimer:null,
  stuckTimer:null, stuckStep:0,
  pendingEmail:null,
  // Plenary / debrief state
  debriefModId:null,
  plenReportDone:false,
  plenQuizAnswered:0,
  plenQuizTotal:0,
  // Gamification tracking — resets each run, never touches GAMIFICATION object
  quizCorrect:0, quizTotal:0,
  phishReported:false, ipWon:false, livesLost:0,
  selectedEmailId:null,
  emailOpened:false, // set true when email content shown
  briefingsSeen:new Set(), howToPlaySeen:false, stuckCount:0,
  // Per-session escalation control
  sessionFlags:{allGreenUsed:false, highEscalationUsed:false, lastWasLow:false},
};

function uid(){return Math.random().toString(36).substr(2,8).toUpperCase();}


// ── WELCOME MODAL ─────────────────────────────────────────────
(function(){
  // Mini matrix rain on welcome canvas
  const cv=document.getElementById('wm-matrix');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  const ch='01アイウエオ@#ABCDEFabcdef';
  let dr=[];
  function rsz(){cv.width=innerWidth;cv.height=innerHeight;dr=Array.from({length:Math.floor(cv.width/14)},()=>Math.random()*-80);}
  rsz();window.addEventListener('resize',rsz);
  setInterval(()=>{
    ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,cv.width,cv.height);
    ctx.fillStyle='#00ff41';ctx.font='12px Share Tech Mono,monospace';
    dr.forEach((y,i)=>{ctx.fillText(ch[Math.floor(Math.random()*ch.length)],i*14,y*14);if(y*14>cv.height&&Math.random()>.975)dr[i]=0;dr[i]++;});
  },50);
})();

function launchMission(){
  try{SFX.unlock();SFX.btnClick();}catch(ex){}
  // Dismiss the welcome modal immediately and reliably
  var modal=document.getElementById('welcomeModal');
  if(modal){
    modal.style.opacity='0';
    modal.style.pointerEvents='none';
    setTimeout(function(){if(modal)modal.style.display='none';},400);
  }
  // Make sure the game is initialised (in case _boot hasn't run yet)
  try{
    if(!GS||GS.modId===undefined){ if(typeof _boot==='function')_boot(); }
  }catch(ex){ if(typeof _boot==='function')_boot(); }
  // Nudge the player toward the first action
  setTimeout(function(){
    try{SFX.newMail();}catch(ex){}
    var br=document.getElementById('btnRefresh');
    if(br)br.classList.add('pulse-glow');
  },450);
}

function askReset(){
  document.getElementById('resetConfirm').classList.add('open');
}
function confirmReset(){
  document.getElementById('resetConfirm').classList.remove('open');
  resetAll();
}

// ── BOOT ──────────────────────────────────────────────────────

// ── XP POPUP — centre screen, scrolling number animation ─────

// ── ATTACK BRIEFING — shown after tool select, before data cards ─







// ── STUCK TIMER — fires context-sensitive hints if card not answered ──
function startStuckTimer(){
  clearStuckTimer();
  GS.stuckTimer=setTimeout(function fireStuck(){
    const pool=(MODULE_GROUP_CHAT[GS.modId]||{}).onStuck;
    if(pool&&pool.length){
      var _si=Math.min(GS.stuckCount,pool.length-1);
      var _hk=GS.modId+'_stuck_'+_si;
      // Only show each hint once per module session
      if(!GS.shownHints.has(_hk)){
        GS.shownHints.add(_hk);
        const e=pool[_si];
        gcMsg(e.persona,pick(e.msgs));
        GS.stuckCount++;
        // Schedule next hint only if more remain
        if(GS.stuckCount<pool.length)
          GS.stuckTimer=setTimeout(fireStuck, 45000);
        return;
      }
      GS.stuckCount++;
    }
    if(GS.stuckCount<(pool?pool.length:0))
      GS.stuckTimer=setTimeout(fireStuck, 45000);
  },14000);
}
function clearStuckTimer(){
  if(GS.stuckTimer){clearTimeout(GS.stuckTimer);GS.stuckTimer=null;}
}


// ══════════════════════════════════════════════════════════════
// UNIFIED MODAL SYSTEM — one container, bulletproof show/hide
// ══════════════════════════════════════════════════════════════
function gameModalEl(){ return document.getElementById('gameModal'); }

function showGameModal(innerHTML, onClose){
  var el=gameModalEl();
  if(!el){ if(onClose)onClose(); return; }
  var body=document.getElementById('gameModalBody');
  if(!body){ if(onClose)onClose(); return; }
  body.innerHTML=innerHTML;
  el.style.display='flex';
  // The single OK/continue button inside the modal closes it
  var ok=document.getElementById('gameModalOk');
  if(ok){
    ok.onclick=function(){
      el.style.display='none';
      body.innerHTML='';
      if(onClose)onClose();
    };
  }
}

function showXPModal(amount,label,onClose){
  var html='<div class="gm-xp-ring"><div class="gm-xp-amt">+'+amount+'</div><div class="gm-xp-unit">XP</div></div>'
          +'<div class="gm-title">'+(label||'XP Earned!')+'</div>'
          +'<button class="btn btn-g btn-orb gm-ok" id="gameModalOk">NEXT &rarr;</button>';
  showGameModal(html, onClose);
}

function showAttackBriefing(mod){
  try{
    var b=mod&&mod.briefing; if(!b)return;
    var html='<div class="gm-flash">&#9889; NEW ATTACK TYPE &#9889;</div>'
            +'<div class="gm-brief-title">'+esc(b.title||'')+'</div>'
            +'<div class="gm-brief-tag">'+esc(b.tagline||'')+'</div>'
            +'<div class="gm-brief-sec"><div class="gm-brief-lbl">WHAT IS IT?</div><div class="gm-brief-txt">'+esc(b.summary||'')+'</div></div>'
            +'<div class="gm-brief-sec"><div class="gm-brief-lbl">&#128269; WHAT TO WATCH FOR</div><div class="gm-brief-txt" style="color:#ffe082">'+esc(b.watchFor||'')+'</div></div>'
            +'<div class="gm-brief-sec"><div class="gm-brief-lbl">&#127757; REAL WORLD CASE</div><div class="gm-brief-txt" style="color:#b0d0ff;font-style:italic">'+esc(b.realWorld||'')+'</div></div>'
            +'<button class="btn btn-g btn-orb gm-ok" id="gameModalOk">&#128373;&#65039; START INVESTIGATION &rarr;</button>';
    showGameModal(html, null);
  }catch(e){console.warn('Briefing error:',e);}
}

function _boot(){
  if(window._bootDone)return; window._bootDone=true;
  if(!GS.briefingsSeen)GS.briefingsSeen=new Set();
  initMatrix();
  rHearts();rXP();rRound();setStep(0);
  gcMsg('zara',  pick(GENERAL_GROUP_CHAT.welcome[0].msgs),700);
  gcMsg('marcus',pick(GENERAL_GROUP_CHAT.welcome[1].msgs),4000);
  gcMsg('priya', pick(GENERAL_GROUP_CHAT.welcome[2].msgs),8000);
  // Auto-start: dispatch first module after welcome messages settle
  setTimeout(function(){ if(!GS.active){ refreshInbox(); } }, 10000);
  idleLoop();
}
// Handles both normal <script> loading and dynamic loading via loader.js
// Boot is handled by loader_alevel.js → calls _boot() after all files load

// ── MATRIX ────────────────────────────────────────────────────
function initMatrix(){
  const cv=document.getElementById('matrixCanvas'),ctx=cv.getContext('2d');
  const ch='ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオ0123456789@#$%^&*';
  let dr=[];
  function rsz(){cv.width=innerWidth;cv.height=innerHeight;dr=Array.from({length:Math.floor(cv.width/14)},()=>Math.random()*-60);}
  rsz();window.addEventListener('resize',rsz);
  setInterval(()=>{
    const al=document.body.classList.contains('alert-mode');
    ctx.fillStyle=al?'rgba(0,0,0,.06)':'rgba(0,0,0,.05)';
    ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle=al?'#ff0040':'#00ff41';
    ctx.font='12px Share Tech Mono,monospace';
    dr.forEach((y,i)=>{ctx.fillText(ch[Math.floor(Math.random()*ch.length)],i*14,y*14);if(y*14>cv.height&&Math.random()>.975)dr[i]=0;dr[i]++;});
  },50);
}

// ── UI HELPERS ────────────────────────────────────────────────
function rHearts(){/* no-op — lives display removed */}
function loseH(why){/* lives removed for Y12 — wrong actions still tracked for scoring */addXP(-5);if(why)toast(why,'bad');}
function rXP(){document.getElementById('xpNum').textContent=GS.xp;document.getElementById('xpFill').style.width=Math.min(100,(GS.xp/500)*100)+'%';}
function addXP(n){
  if(!n)return;
  GS.xp=Math.max(0,GS.xp+n);
  rXP();
}
function rRound(){document.getElementById('roundNum').textContent=GS.round+'/'+GS.totalRounds;}
function setSim(t){document.getElementById('simStatus').textContent=t;}
function toast(msg,type='ok'){/* top-right notifications removed — hints flow through group chat */ }

function setStep(n){
  for(let i=1;i<=5;i++){const el=document.getElementById('st'+i);if(!el)continue;el.classList.remove('on','done');if(i===n)el.classList.add('on');else if(i<n)el.classList.add('done');}
  clearTimeout(GS.stuckTimer);
  if(n>0&&n<5){GS.stuckStep=n;GS.stuckTimer=setTimeout(()=>{if(GS.stuckStep===n&&GS.active)offerHelp(n);},50000);}
  // Glow the panel the child needs to use right now
  clearGlows();
  if(n===1){setGlow('inboxPanel','action-glow');setGlow('emailPanel','action-glow');}
  else if(n===2){setGlow('toolPanel','action-glow');}
  else if(n===3||n===4){setGlow('toolPanel','amber-glow');}
  else if(n===5){setGlow('toolPanel','action-glow');}
  // On mobile: bring the relevant panel into view automatically
  if(typeof mobileAutoTab==='function') mobileAutoTab(n);
}
function setGlow(id,cls){const el=document.getElementById(id);if(el)el.classList.add(cls);}
function clearGlows(){
  ['inboxPanel','emailPanel','toolPanel','chatPanel'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.classList.remove('action-glow','amber-glow');}
  });
}
function offerHelp(step){
  const hints={
    1:["Open the alert email — it tells you what type of incident this is.","Click the email in the inbox, then press OPEN ALERT to read it."],
    2:["Select the investigation tool that matches the incident type described in the email, then click LOAD TOOL.","Re-read the email — the incident type maps directly to the correct tool."],
    3:["Work through each item. Consider the key indicators: rate, flags, algorithm, payload or pattern.","Assess each entry against the classification criteria. What makes this item RED, AMBER or GREEN?"],
    4:["Select the appropriate action for each remaining item based on your severity assessment.","Complete the assessment — choose the correct action for each unhandled item."],
  };
  gcMsg(pick(['zara','marcus','priya']),pick(hints[step]||hints[2]));
}

// ── SMARTCHAT STUBS (removed — no longer used) ─────────────────
function sendSC(){}
function setSCDis(){}
function initSC(){}

function showTab(t){
  ['E','R'].forEach(n=>{
    document.getElementById('tab'+n).classList.toggle('on',n===t);
    document.getElementById('tabBody'+n).classList.toggle('on',n===t);
  });
}

// ── IDLE CHAT (slow — one message every ~75 seconds) ──────────
function idleLoop(){
  setTimeout(()=>{
    if(!GS.active){const pool=[{p:'marcus',msgs:GENERAL_GROUP_CHAT.idle[0].msgs},{p:'zara',msgs:GENERAL_GROUP_CHAT.idle[1].msgs},{p:'priya',msgs:GENERAL_GROUP_CHAT.idle[2].msgs}];const e=pick(pool);gcMsg(e.p,pick(e.msgs));}
    idleLoop();
  },65000+Math.random()*20000);
}

// ── DIFFICULTY ────────────────────────────────────────────────
function setDiff(v){
  if(GS.active){gcMsg('priya','Finish the current case before checking for new emails.');return;}
  GS.maxH=GS.hearts=parseInt(v);rHearts();
}

// ── ADMIN ─────────────────────────────────────────────────────
function openAdmin(){document.getElementById('adminModal').classList.add('open');}
function closeAdmin(){document.getElementById('adminModal').classList.remove('open');}
function applyAdmin(){
  const mod=document.getElementById('adminModSel').value;
  const rnds=parseInt(document.getElementById('adminRounds').value)||4;
  GS.forceMod=mod||null;GS.totalRounds=rnds;rRound();closeAdmin();toast('Admin settings applied!','warn');
}

// ── REFRESH INBOX ─────────────────────────────────────────────
function refreshInbox(){
  try{
  try{SFX.newMail();}catch(e){}clearTimeout(GS.autoTimer);
  var _br=document.getElementById('btnRefresh');if(_br)_br.classList.remove('pulse-glow');
  if(GS.active){gcMsg('priya','Finish the current case before checking for new emails.');return;}
  // Reset email/results pane for fresh mission
  document.getElementById('welcomeMsg').style.display='block';
  document.getElementById('emailView').style.display='none';
  showTab('E');
  clearEmailActionBar();
  // Only show endgame when ALL rounds done AND no exceptions left in queue
  if(GS.round>=GS.totalRounds&&!GS.queue.length){showEndgame();return;}
  if(GS.forceMod){const m=GS.forceMod;GS.forceMod=null;dispatchMod(m);return;}
  if(!GS.queue.length)buildQueue();
  var _nextMod=GS.queue.shift();
  dispatchMod(_nextMod);
  // After pre-brief+loadModule adds email, auto-open it
  // (selectInboxEmail + actOnSelectedEmail run when email appears)
  }catch(err){
    console.error('refreshInbox error:',err);
    var b=document.getElementById('__errbox');
    if(b){b.style.display='block';b.textContent+='refreshInbox ERROR: '+err.message+'\n  '+(err.stack||'').split('\n')[1]+'\n\n';}
    else{ gcMsg('priya','⚠ Something went wrong loading the case: '+err.message); }
  }
}
function dispatchMod(id){
  if(id==='__phish__')  loadPhish();
  else if(id==='__iptrace__') loadIPTrace();
  else {
    var _m=MODULES[id];
    if(_m&&_m.diagnosticQuestions&&_m.diagnosticQuestions.length&&!GS.preBriefDone.has(id)){
      showPreBrief(_m,function(){ GS.preBriefDone.add(id); loadModule(id); });
    } else {
      loadModule(id);
    }
  }
}
function buildQueue(){
  // Anti-repetition queue builder
  // recentMods = ordered array, oldest first, newest last.
  // Modules not in the array are "unseen" and get highest priority.
  // Within a session of 4 we NEVER repeat a module.
  // Across sessions, recently-used modules sort to the back.
  var recent=SESSION_HISTORY.recentMods;

  // Split into unseen (not in recent) and seen (in recent, oldest first)
  var unseen=MODULE_LIST.filter(function(m){return recent.indexOf(m)===-1;});
  var seen=MODULE_LIST.filter(function(m){return recent.indexOf(m)!==-1;});
  // seen is already implicitly sorted by position in recent (oldest=lowest index)
  // shuffle within each group for variety, then concatenate
  var pool=shuffle(unseen).concat(shuffle(seen));

  // Take first totalRounds — guaranteed no repeats within this queue
  var mods=pool.slice(0,GS.totalRounds);

  // Update recency: move each chosen module to the end (most recent)
  mods.forEach(function(m){
    var i=recent.indexOf(m);
    if(i!==-1)recent.splice(i,1);
    recent.push(m);
  });
  // Cap to MODULE_LIST length so the array never grows stale
  while(recent.length>MODULE_LIST.length)recent.shift();

  // Exceptions (phishing, IP trace) removed for this version
  GS.queue=mods;
}
function schedAutoAdvance(delay=18000){
  clearTimeout(GS.autoTimer);
  // Keep going while there are rounds left OR exceptions still in the queue
  const moreToGo=GS.round<GS.totalRounds||GS.queue.length>0;
  if(!GS.active&&moreToGo){
    GS.autoTimer=setTimeout(()=>{
      if(!GS.active&&(GS.round<GS.totalRounds||GS.queue.length>0)){
        gcMsg('marcus',pick(['New alert in the queue.','Next incident has arrived.','Another case to triage.']));
        setTimeout(refreshInbox,1500);
      }
    },delay);
  }
}


// ── SCENARIO PARAMS — controls escalation count, type and edge cases ──
function buildScenarioParams(){
  const f=GS.sessionFlags;
  const r=GS.round+1; // about to play this round

  // All-green: once per game, not first round, not if last was already low
  if(!f.allGreenUsed && !f.lastWasLow && r>=2 && r<GS.totalRounds && Math.random()>.72){
    f.allGreenUsed=true;
    return {numEscalations:0,escalationType:'none',includeEdgeCase:false,numItems:6,difficulty:GS.difficulty||1};
  }
  // High escalation: once per game, not first round
  if(!f.highEscalationUsed && r>=2 && Math.random()>.55){
    f.highEscalationUsed=true;
    return {numEscalations:randInt(3,4),escalationType:pick(['RED_RED_AMBER','RED_RED_RED','RED_AMBER_AMBER']),includeEdgeCase:true,numItems:7,difficulty:GS.difficulty||1};
  }
  // Prevent two sequential low-escalation rounds
  const minE=f.lastWasLow?2:1;
  const numE=pick([1,2,2,2,2,3].filter(n=>n>=minE));
  let escalType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']);
  // Avoid repeating the exact same pattern for this module this session
  const k=`${GS.modId}_${numE}_${escalType}`;
  if(SESSION_HISTORY.scenarioKeys.has(k)){
    const alts=['RED_AMBER','RED_RED','AMBER_AMBER'].filter(t=>!SESSION_HISTORY.scenarioKeys.has(`${GS.modId}_${numE}_${t}`));
    if(alts.length) escalType=alts[0];
  }
  SESSION_HISTORY.scenarioKeys.add(`${GS.modId}_${numE}_${escalType}`);
  return {numEscalations:numE,escalationType:escalType,includeEdgeCase:Math.random()>.3,numItems:6,difficulty:GS.difficulty||1};
}




// ── ANALYST PRE-BRIEF — chat-based ───────────────────────────
var _pb = {};

function showPreBrief(mod, onComplete){
  if(!mod||!mod.diagnosticQuestions||!mod.diagnosticQuestions.length){if(onComplete)onComplete();return;}
  function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  _pb={pool:shuf(mod.diagnosticQuestions).slice(0,5),idx:0,score:0,onComplete:onComplete};
  gcMsg('priya','New case incoming. Quick knowledge check first — five questions.',400);
  setTimeout(_pbChatQ, 1400);
}

function _pbChatQ(){
  if(!_pb||!_pb.pool||_pb.idx==null||_pb.idx>=_pb.pool.length)return;
  var idx=_pb.idx, q=_pb.pool[idx];
  if(!q||!q.opts)return;
  var opts=q.opts.map(function(t,i){return{text:t,ok:(i===q.ok),hint:q.hint||''};});
  for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;}
  _pb.shuffled=opts;
  _pb.correctIdx=opts.findIndex(function(o){return o.ok;});

  var asker=pick(['zara','marcus','priya']);
  var btns=opts.map(function(o,i){
    return '<button class="pb-opt" onclick="_pbChatAns('+i+')">'+esc(o.text)+'</button>';
  }).join('');

  var now=new Date();
  var t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var w=document.createElement('div');
  w.className='cmsg p'+asker+' cmsg-pb';
  w.id='pb-q-'+idx;
  w.innerHTML=
    '<div class="chdr"><span class="cname">'+esc(PERSONAS[asker].name)+'</span>'+
    '<span class="ctime">'+t+'&nbsp;&nbsp;'+( idx+1)+'/5</span></div>'+
    '<div class="cbub">'+
    '<div class="pb-qlbl">PRE-BRIEF</div>'+
    '<div class="pb-qtext">'+esc(q.q)+'</div>'+
    '<div class="pb-opts">'+btns+'</div>'+
    '</div>';

  var box=document.getElementById('chatMsgs');
  if(box){box.appendChild(w);box.scrollTop=box.scrollHeight;}
  try{SFX.chatPing();}catch(e){}
}

window._pbChatAns=function(chosen){
  // Guard: bail if _pb has been cleared or this question already answered
  if(!_pb||!_pb.pool||!_pb.shuffled||_pb.answered)return;
  _pb.answered=true;  // prevent double-fire

  var correct=(chosen===_pb.correctIdx);
  if(correct)_pb.score++;
  // Read and immediately clear shuffled so any re-click hits the guard
  var hint=(_pb.shuffled[_pb.correctIdx]||{}).hint||'';
  var rightText=(_pb.shuffled[_pb.correctIdx]||{}).text||'';
  var correctIdx=_pb.correctIdx;
  _pb.shuffled=null;  // nulled immediately — re-clicks now blocked by guard

  // Style buttons
  var msgEl=document.getElementById('pb-q-'+_pb.idx);
  if(msgEl){
    msgEl.querySelectorAll('.pb-opt').forEach(function(b,i){
      b.disabled=true;
      b.removeAttribute('onclick');
      b.className='pb-opt '+(i===correctIdx?'pbo-ok':(i===chosen?'pbo-err':'pbo-dim'));
    });
  }
  _pb.idx++;

  var responder=pick(['zara','marcus','priya']);
  var fb=correct
    ? pick(['Correct. ','Right. ','Yes. '])+(hint||'')
    : 'No — '+(hint||rightText+'.');
  var nextIdx=_pb.idx;
  var poolLen=(_pb.pool||[]).length;

  setTimeout(function(){
    gcMsg(responder,fb,0);
    if(nextIdx<poolLen){
      setTimeout(function(){
        _pb.answered=false;  // reset only just before new question renders
        _pbChatQ();
      },900);
    } else {
      setTimeout(_pbChatFinal,900);
    }
  },250);
};

function _pbChatFinal(){
  var s=_pb.score,t=_pb.pool.length;
  var diff=s<=1?0:s<=3?1:2;
  GS.difficulty=diff;
  var cfgs=[
    {label:'FOUNDATION',col:'#4dc8ff',glow:'rgba(77,200,255,.5)',
     desc:'Clear cases. Hints on.'},
    {label:'STANDARD',  col:'var(--g)',glow:'rgba(0,255,65,.5)',
     desc:'Balanced case mix.'},
    {label:'ADVANCED',  col:'var(--amb)',glow:'rgba(255,170,0,.5)',
     desc:'Edge cases. Minimal hints.'},
  ];
  var cfg=cfgs[diff];

  // Score message
  gcMsg('priya',s+'/'+t+' — '+(s>=4?'strong.':s>=2?'solid.':'noted.'),200);

  // Difficulty badge as a chat message
  setTimeout(function(){
    var now=new Date();
    var ts=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    var w=document.createElement('div');
    w.className='cmsg cmsg-diff';
    w.innerHTML=
      '<div class="cbub" style="border:1px solid '+cfg.col+';box-shadow:0 0 10px '+cfg.glow+'30;">'+
      '<span class="pb-diff-name" style="color:'+cfg.col+';text-shadow:0 0 14px '+cfg.glow+';">'+cfg.label+'</span>'+
      '<span class="pb-diff-desc">'+cfg.desc+'</span>'+
      '</div>';
    var box=document.getElementById('chatMsgs');
    if(box){box.appendChild(w);box.scrollTop=box.scrollHeight;}

    var cb=_pb.onComplete; _pb={};
    setTimeout(function(){if(cb)cb();},500);
  },900);
}

// ── LOAD MODULE ───────────────────────────────────────────────
function loadModule(id){
  const mod=MODULES[id];
  if(!mod){console.error('loadModule: no module',id);return;}
  if(!mod.tools||!mod.tools.correct){
    console.error('loadModule: module missing tools.correct',id);
    document.getElementById('toolData').innerHTML='<div class="terr">⚠ This module is not fully set up. Please refresh for the next mission.</div>';
    return;
  }
  // Guard: close any stale plenary, clear chat for fresh mission
  var _elplenaryModal=document.getElementById('plenaryModal');if(_elplenaryModal)_elplenaryModal.classList.remove('open');
  GS.debriefModId=null;GS.plenReportDone=false;GS.plenQuizAnswered=0;GS.plenQuizTotal=0;
  GS.emailOpened=false;GS.stuckCount=0;GS.stuckStep=0;GS.shownHints=new Set();GS.lastHintTime=0;clearStuckTimer();
  GS.round++;rRound();  // only real modules count
  GS.modId=id;GS.correctTool=mod.tools.correct;GS.toolOk=false;
  GS.reportReady=false;GS.badTools=0;GS.active=true;
  GS.scenarioRagDone=true;
  const _params=buildScenarioParams();
  GS.scenario=mod.generateScenario(_params);
  const _esc=GS.scenario.filter(s=>s.ragAnswer!=='G').length;
  GS.sessionFlags.lastWasLow=_esc<=1;
  document.getElementById('scenProg').textContent='ROUND '+GS.round+'/'+GS.totalRounds;
  setSim(mod.name);setStep(1);
  resetTool();
  // Build tool tile grid
  var tg=document.getElementById('toolGrid');
  if(tg){
    tg.innerHTML='';
    getToolOptions(id).forEach(function(t){
      var tile=document.createElement('div');
      tile.className='tool-tile';
      tile.dataset.tool=t;
      var icon=TOOL_ICONS[t]||'🔧';
      tile.innerHTML='<span class="tt-icon">'+icon+'</span><span class="tt-name">'+esc(t)+'</span>';
      tile.addEventListener('click',function(){
        tg.querySelectorAll('.tool-tile').forEach(function(x){x.classList.remove('sel','tt-wrong');});
        tile.classList.add('sel');
        document.getElementById('toolSel').value=t;
        loadTool();
      });
      tg.appendChild(tile);
    });
  }
  document.getElementById('toolSel').value='';
  const email={id:Date.now(),sender:mod.emailSender(),subject:mod.emailSubject(),body:mod.emailBody(GS.scenario)+'\n\nLoad the investigation tool below. For each item, assess severity: RED (immediate threat), AMBER (investigate), or GREEN (legitimate). Select the appropriate action for each entry.',modId:id,phish:false};
  GS.pendingEmail=email;
  addToInbox(email);
  setTimeout(()=>gcModLoad(id),800);
}

function resetTool(){
  if(GS.gfr){cancelAnimationFrame(GS.gfr);GS.gfr=null;}
  const _gc=document.getElementById('graphCanvas'); if(_gc)_gc.style.display='none';
  document.getElementById('toolData').innerHTML='<div class="tph">📧 Open the alert email, then select the appropriate investigation tool above and click <strong>▶ LOAD TOOL</strong>.</div>';
  document.getElementById('toolBar').innerHTML='<span class="bhint">Read the alert email to identify the incident type, then select the matching tool.</span>';
}

// ── INBOX ─────────────────────────────────────────────────────
function addToInbox(email){
  document.getElementById('ilistEmpty').style.display='none';
  const list=document.getElementById('ilist');
  const el=document.createElement('div');
  el.className='eitem unread'+(email.phish?' phish':'');
  el.dataset.eid=email.id;
  el.dataset.sender=email.sender;
  el.dataset.subject=email.subject;
  el.dataset.body=email.body||'';
  el.innerHTML=`
    <div class="ef">${esc(email.sender)}</div>
    <div class="es">${esc(email.subject)}</div>
    <div class="et">Just now</div>`;
  // Clicking the inbox item selects it and (for regular emails) opens content
  el.addEventListener('click',()=>{
    if(el.classList.contains('done'))return;
    selectInboxEmail(email.id, email);
    if(!email.phish){showEmailContent(email);setStep(2);}
  });
  list.insertBefore(el,list.firstChild);
  // Auto-select AND auto-open email (no manual click required)
  setTimeout(()=>{
    selectInboxEmail(email.id, email);
    if(!email.phish){ showEmailContent(email); setStep(2); }
  },350);
}

function selectInboxEmail(id, email){
  GS.selectedEmailId=id;
  document.querySelectorAll('.eitem').forEach(i=>i.classList.remove('sel'));
  const el=document.querySelector(`[data-eid="${id}"]`);
  if(el){el.classList.add('sel');el.classList.remove('unread');}
  // Enable the action bar buttons
  const btnO=document.getElementById('btnOpenEmail');
  const btnR=document.getElementById('btnFlagEmail');
  if(btnO)btnO.disabled=false;
  if(btnR)btnR.disabled=false;
  // Pulse the OPEN button to guide the child
  if(btnO){btnO.classList.add('pulse-glow');setTimeout(()=>btnO.classList.remove('pulse-glow'),4000);}
}

function clearEmailActionBar(){
  GS.selectedEmailId=null;
  const btnO=document.getElementById('btnOpenEmail');
  const btnR=document.getElementById('btnFlagEmail');
  if(btnO){btnO.disabled=true;btnO.classList.remove('pulse-glow');}
  if(btnR)btnR.disabled=true;
}

// Called by the OPEN IT / REPORT IT buttons above the inbox
function actOnSelectedEmail(action){
  const id=GS.selectedEmailId;
  if(id==null)return;
  const el=document.querySelector(`[data-eid="${id}"]`);
  if(!el||el.classList.contains('done'))return;
  if(el.classList.contains('phish')){
    doEmail(id,action,null);
  } else {
    if(action==='open'){
      const email={id,sender:el.dataset.sender,subject:el.dataset.subject,body:el.dataset.body};
      showEmailContent(email);setStep(2);
    } else {
      // Reported a genuine email by mistake — real consequence + chat feedback,
      // consistent with every other wrong decision in the game.
      loseH('Reported a genuine email');
      addXP(-5);
      var _fpWho=pick(['priya','zara','marcus']);
      var _fpMsgs=[
        "That one's actually genuine — no need to report it! It's safe to open. (-5 XP)",
        "Hold on — that email looks legitimate. You can open this one safely. (-5 XP)",
        "False alarm! That one's a real email, not a trick. Try opening it instead. (-5 XP)",
        "That one was actually fine! Reporting genuine emails wastes the security team's time too. (-5 XP)"
      ];
      gcMsg(_fpWho,pick(_fpMsgs));
    }
  }
}

function showEmailContent(email){
  GS.emailOpened=true;
  document.getElementById('welcomeMsg').style.display='none';
  const v=document.getElementById('emailView');v.style.display='block';
  v.innerHTML=`<div class="evmeta"><span class="evlbl">FROM</span><span class="evval">${esc(email.sender)}</span><span class="evlbl evsep">SUBJECT</span><span class="evval evbig">${esc(email.subject)}</span></div><div class="evbody">${esc(email.body)}</div>`;
  showTab('E');
}

function doEmail(id,action,evt){
  if(evt)evt.stopPropagation();
  const el=document.querySelector(`[data-eid="${id}"]`);
  if(!el||el.classList.contains('done'))return;
  const isPhish=el.classList.contains('phish');
  if(isPhish){
    el.classList.add('done');el.classList.remove('sel','unread','phish');
    if(action==='open'){
      loseH('Opened a fake email!');addXP(-20);
      const e=pick(PHISHING_EXCEPTION_CHAT.onOpened);gcMsg(e.persona,pick(e.msgs));
      toast('⚠ That was a fake email! Always check the address first!','bad');
      const v=document.getElementById('emailView');v.style.display='block';
      v.innerHTML=`<div class="evmeta"><div class="evlbl">RESULT</div><div class="evval cR">✗ Spoofed email opened</div></div>
        <div class="evbody">That sender address was fraudulent — a lookalike domain designed to pass a quick glance.\n\nIndicators to check: full sender domain (not just display name), urgency language, and whether links lead to the legitimate domain.\n\nAlways verify the sender address before opening suspicious emails.</div>`
    } else {
      addXP(30);GS.phishReported=true;
      const e=pick(PHISHING_EXCEPTION_CHAT.onReported);gcMsg(e.persona,pick(e.msgs));
      toast('✓ Great spotting — fake email reported!','ok');
      const v=document.getElementById('emailView');v.style.display='block';
      v.innerHTML=`<div class="evmeta"><div class="evlbl">RESULT</div><div class="evval cG">✓ Spoofed email identified and reported</div></div>
        <div class="evbody">Correct — the sender domain was a lookalike and you reported it before opening.\n\nCommon spoofing techniques:\n• Character substitution (paypa1.com, go0gle.com)\n• Lookalike subdomains (paypal.com.attacker.net)\n• Display name spoofing (legitimate name, fraudulent address)\n\nVerify the full sender domain on every suspicious email.</div>`
    }
    GS.active=false;setSim('READY');setStep(0);clearEmailActionBar();
    schedAutoAdvance(12000);
    return;
  }
  if(action==='open'){
    el.classList.remove('unread');
    const emailObj=GS.pendingEmail&&GS.pendingEmail.id===id?GS.pendingEmail:
      {id,sender:el.querySelector('.ef').textContent,subject:el.querySelector('.es').textContent,body:'(Email content unavailable)',phish:false};
    showEmailContent(emailObj);setStep(2);
  } else {
    toast('Nothing suspicious here — use Open to read it.','warn');
  }
}

// ── TOOL ──────────────────────────────────────────────────────
function loadTool(){
  if(!GS.emailOpened){gcMsg('zara','Open the alert email first — that identifies the incident type and the correct tool.');return;}
  const v=document.getElementById('toolSel').value;
  if(!v){gcMsg('marcus','Select an investigation tool from the dropdown above.');return;}
  if(!GS.active){toast('No scenario active','warn');return;}
  if(GS.toolOk){toast('Tool already loaded','warn');return;}
  if(v===GS.correctTool){
    GS.toolOk=true;GS.badTools=0;
    GS.scenarioRagDone=true;
    // STEP 1: Render data cards IMMEDIATELY. Nothing can stop this.
    renderToolData();
    setStep(3);
    // STEP 2: Award XP + tell the team via chat (no modal).
    addXP(10);
    var _toolMsgs=['✓ Correct tool. +10 XP. Work through each item below.','✓ Tool loaded. +10 XP. Assess each entry in turn.','✓ Right call. +10 XP. Triage each item systematically.','✓ Confirmed. +10 XP. Review each item carefully.'];
    gcMsg('marcus',pick(_toolMsgs),200);
    // First time EVER seeing investigation cards — explain the mechanic once
    if(!GS.howToPlaySeen){
      GS.howToPlaySeen=true;
      gcMsg('priya','For each item: classify severity — RED (act immediately), AMBER (investigate), or GREEN (legitimate) — then select the correct action.',900);
    }
    gcMod(GS.modId,'onToolCorrect');
    try{SFX.correct();}catch(e){}
    // STEP 3: Post the case briefing to chat.
    try{
      var m=MODULES[GS.modId];
      if(m&&m.briefing&&GS.briefingsSeen&&!GS.briefingsSeen.has(GS.modId)){
        GS.briefingsSeen.add(GS.modId);
        var b=m.briefing;
        gcMsg('priya','📋 NEW CASE: '+b.title+' — '+b.tagline,300);
        gcMsg('zara',b.summary,1400);
        gcMsg('marcus','🔍 Watch for: '+b.watchFor,3000);
      }
    }catch(e){console.warn('Modal error (data still loaded):',e);}
  } else {
    GS.badTools++;loseH('Wrong tool');addXP(-5);gcMod(GS.modId,'onToolWrong');/*vox*/;
    // Shake the wrong tile
    var wt=document.querySelector('.tool-tile.sel');
    if(wt){wt.classList.remove('sel');wt.classList.add('tt-wrong');setTimeout(function(){wt.classList.remove('tt-wrong');},600);}
    document.getElementById('toolSel').value='';
    const hint=GS.badTools>=2?'<br><br><em>Hint: re-read the alert email — the incident type indicates the correct tool.</em>':'';
    document.getElementById('toolData').innerHTML=`<div class="terr">✗ <strong>${esc(v)}</strong> is not the correct tool for this incident type.${hint}<br><br>Review the email and try again.</div>`;
  }
}


// ── LEGENDS — quick reference above data cards ─────────────────
var MODULE_LEGENDS = {
  ddos:           '🔴 Over 10× normal → Block   🟡 3–10× normal → Slow it down   🟢 Normal → Leave it',
  malware:        '🔴 Unknown program → Quarantine   🟡 Real but acting odd → Investigate   🟢 Known & normal → Leave it',
  ransomware:     '🔴 Bad extension + lots encrypted → Isolate   🟡 Suspicious extension, few files → Investigate   🟢 Normal → Leave it',
  phishingModule: '🔴 Fake address → Report   🟢 Real address → Deliver it',
  bruteForce:     '🔴 Very fast + very few IPs → Lock   🟡 Suspicious pattern → Investigate   🟢 Normal typos → Leave it',
  socialEng:      '🔴 Asks for password/access, urgent or secret → Block   🟡 Unusual, needs checking → Verify   🟢 Proper process followed → OK',
  usbDrop:        '🔴 Unknown device + autorun → Quarantine   🟡 Unknown, no autorun → Investigate   🟢 Company device → OK',
};

// ── RENDER TABLE (card layout) ─────────────────────────────────
function renderToolData(){
  const id=GS.modId,sc=GS.scenario,cols=MODULE_COLUMNS[id];
  if(!sc||!Array.isArray(sc)){
    document.getElementById('toolData').innerHTML='<div class="terr">⚠ No scenario data — try refreshing your inbox.</div>';
    console.error('renderToolData: scenario missing for',id,sc);return;
  }
  if(!cols){
    document.getElementById('toolData').innerHTML='<div class="terr">⚠ Module not configured for this tool.</div>';
    console.error('renderToolData: columns missing for',id);return;
  }
  // Legend strip at top
  const legend=MODULE_LEGENDS[id]||'';
  document.getElementById('toolPanel').classList.add('active-tool');
  let html=legend?`<div class="legend-strip">${esc(legend)}</div>`:'';
  sc.forEach((item,i)=>{
    const done=item.handled;
    const borderCol=done?(item.ragAnswer==='R'?'var(--red)':item.ragAnswer==='A'?'var(--amb)':'var(--g)'):'rgba(0,255,65,0.18)';
    html+=`<div class="dcard${done?' done':''}" id="dr${i}" style="border-left:5px solid ${borderCol};animation-delay:${i*0.06}s" >`;
    html+=`<div class="dcard-head">`;
    html+=`<span class="dcard-name">${esc(item.name)}</span>`;
    if(done){const ok=item.userAction===item.actionAnswer;html+=`<span class="sbadge ${ok?'sbok':'sberr'}">${ok?'✓':'✗'}</span>`;}
    else{html+=`<span class="sbadge sbpend">ASSESS</span>`;}
    html+=`</div>`;
    html+=`<div class="dcard-vals">`;
    cols.slice(1).forEach(c=>{
      let v=item[c.key];if(v===null||v===undefined)v='—';if(typeof v==='number')v=v.toLocaleString();
      let valStyle='';
      if(c.key==='cvssScore'){valStyle=`color:${v>=9?'var(--red)':v>=7?'var(--amb)':v>=4?'#eeee00':'var(--g)'};font-weight:bold`;}
      else if(c.key==='severity'){valStyle=`color:${v==='CRITICAL'?'var(--red)':v==='HIGH'?'var(--amb)':v==='MEDIUM'?'#eeee00':'var(--g)'}`;}
      if(c.key==='purpose'){
        html+=`<div class="dval dval-wide"><span class="dval-lbl">${c.label}</span><span class="dval-v dval-desc">${esc(String(v))}</span></div>`;
      } else {
        html+=`<div class="dval"><span class="dval-lbl">${c.label}</span><span class="dval-v" style="${valStyle}">${esc(String(v))}</span></div>`;
      }
    });
    html+=`</div>`;
    // Plain English context — depth varies by difficulty level
    // ADVANCED: nothing (raw data only — students who aced pre-brief work from fields alone)
    // STANDARD: factual restatement — what the data IS, no anomaly flags
    // FOUNDATION: interpretive — what's notable, with scaffolding
    const _diff=GS.difficulty||0;
    if(_diff<2){
      const _map=_diff===0?SCENARIO_CONTEXT:SCENARIO_CONTEXT_STD;
      const _ctxMap=_map&&_map[id];
      if(_ctxMap){
        const _ctx=_ctxMap[item.name+'|'+(item.ragAnswer||'')] || _ctxMap[item.name];
        if(_ctx) html+=`<div class="dcard-context${_diff===1?' dcard-context-std':''}">${esc(_ctx)}</div>`;
      }
    }
    // Notes contain the reasoning/answer — only reveal AFTER the student has decided
    if(done&&item.notes){html+=`<div class="dcard-note">${esc(item.notes)}</div>`;}
    if(!done&&GS.scenarioRagDone){
      html+=`<div class="dcard-actions">`;
      (MODULE_ACTIONS[id]||[]).forEach(a=>{
        const cls=a.id==='block'||a.id==='quarantine'||a.id==='isolate'||a.id==='lockAccount'||a.id==='report'?'btn-r':
                  a.id==='ignore'?'btn-d':'btn-a';
        html+=`<button class="btn btn-sm ${cls}" data-row="${i}" data-act="${a.id}">${a.label}</button>`;
      });
      html+=`</div>`;
    } else if(done){
      const ok=item.userAction===item.actionAnswer;
      html+=`<div class="dcard-done-info">${ok?'✓ '+item.userAction:'✗ You said: '+item.userAction+' | Correct: '+item.actionAnswer}</div>`;
    }
    html+=`</div>`;
  });
  document.getElementById('toolData').innerHTML=html;
  // Single delegated click handler — bound once, reads index from data-attr.
  // This eliminates any chance of stale/double inline handlers.
  var td=document.getElementById('toolData');
  if(td && !td._delegated){
    td._delegated=true;
    td.addEventListener('click',function(ev){
      var btn=ev.target.closest('button[data-row]');
      if(!btn)return;
      ev.stopPropagation();
      var row=parseInt(btn.getAttribute('data-row'),10);
      var act=btn.getAttribute('data-act');
      if(!isNaN(row)&&act)doAction(row,act);
    });
  }
  updBar();
  // Start the stuck-hint timer once data is showing (if not all done)
  if(GS.scenario&&!GS.scenario.every(s=>s.handled)){startStuckTimer();}
}

function cardClicked(idx){
  // Card tap does nothing now — action buttons handle everything.
  // (Kept as a no-op so existing onclick attributes don't error.)
}

function doAction(rowIdx,actId){
  clearStuckTimer();GS.stuckCount=0;
  const item=GS.scenario[rowIdx];
  if(!item||item.handled){toast('Already handled!','warn');return;}
  item.handled=true;
  item.userAction=actId;
  const ao=(actId===item.actionAnswer);
  // Flash the card
  var cardEl=document.getElementById('dr'+rowIdx);
  if(cardEl){
    cardEl.classList.remove('flash-ok','flash-err');
    void cardEl.offsetWidth;
    cardEl.classList.add(ao?'flash-ok':'flash-err');
  }
  // Varied XP messages so it doesn't feel robotic
  var rightMsgs=['✓ Correct. +15 XP','✓ Right call. +15 XP','✓ Confirmed. +15 XP','✓ Accurate assessment. +15 XP','✓ Exact match. +15 XP','✓ Correct action. +15 XP','✓ Good analysis. +15 XP','✓ Spot on. +15 XP','✓ Well identified. +15 XP','✓ Precisely right. +15 XP','✓ Correct classification. +15 XP','✓ Correct. +15 XP'];
  var wrongMsgs=['Incorrect — review the item notes below. (-5 XP)','Not this time. Check the reasoning. (-5 XP)','Wrong call — correct action shown. (-5 XP)','Missed that one. (-5 XP)','Incorrect assessment. (-5 XP)','Not right — re-read the indicator. (-5 XP)','Wrong. See the correct answer below. (-5 XP)','Incorrect — note why the answers differ. (-5 XP)','Off. Review the item criteria. (-5 XP)','Incorrect. (-5 XP)'];
  var rightWho=pick(['marcus','zara','priya']);
  var wrongWho=pick(['zara','priya','marcus']);
  if(ao){
    try{SFX.correct();}catch(e){}
    addXP(15);
    gcMsg(rightWho, pick(rightMsgs), 150);
    // Reinforce WHY it was right — use the item's note
    if(item.notes){ gcMsg('priya','💡 '+item.notes, 1100); }
    gcMod(GS.modId,'onActionCorrect',2000);
  } else {
    loseH('Wrong action');
    addXP(-5);
    gcMsg(wrongWho, pick(wrongMsgs), 150);
    // Reinforce WHY: state the correct action + the reason
    var correctLabel=(MODULE_ACTIONS[GS.modId].find(function(a){return a.id===item.actionAnswer;})||{}).label||item.actionAnswer;
    gcMsg('priya','💡 The right call was "'+correctLabel+'". '+(item.notes||''), 1100);
    gcMod(GS.modId,'onActionWrong',2200);
  }
  renderToolData();
  const all=GS.scenario.every(s=>s.handled);
  if(all){setTimeout(()=>{
    gcMod(GS.modId,'onAllHandled');
    GS.reportReady=true;
    renderDebriefButton();
    setStep(5);
  },1900);}
}

function updBar(){
  const bar=document.getElementById('toolBar');
  if(!GS.toolOk){bar.innerHTML='<span class="bhint">Select an investigation tool from the dropdown above and click LOAD TOOL.</span>';return;}
  if(GS.reportReady){renderDebriefButton();return;}
  const all=GS.scenario&&GS.scenario.every(s=>s.handled);
  if(all)bar.innerHTML='<span class="bhint">✅ All items assessed. Proceed to mission debrief below.</span>';
  else bar.innerHTML='<span class="bhint">Assess each item and select the appropriate action.</span>';
}

// ── DEBRIEF BUTTON (replaces old report bar) ──────────────────
function renderDebriefButton(){
  document.getElementById('toolBar').innerHTML=
    `<button class="btn btn-g btn-orb" style="flex:1;padding:12px;font-size:14px;letter-spacing:1px;" onclick="openDebrief()">📋 MISSION DEBRIEF &amp; REPORT →</button>`;
}

// Opened by child clicking the debrief button — captures modId RIGHT NOW, no timer race
function _nextCase(){
  // Clear debrief state
  window._dbQuizAns={};
  window._dbQuizSubmitted=false;
  window._dbRouteDone=false;
  if(GS.round>=GS.totalRounds&&!GS.queue.length){
    showEndgame();return;
  }
  var _who=pick(['priya','zara','marcus']);
  gcMsg(_who,'Case closed. Next assignment incoming.');
  setTimeout(function(){ refreshInbox(); }, 1800);
}

function openDebrief(){
  const savedId=GS.modId;
  const savedScenario=GS.scenario?[...GS.scenario]:[];
  GS.debriefModId=savedId;
  GS.plenReportDone=false;GS.plenQuizAnswered=0;
  // Remove button immediately so it cannot be clicked again
  document.getElementById('toolBar').innerHTML='<span class="bhint">📋 Debrief open — see the right panel!</span>';
  showResults(savedId);
  const emailEl=document.querySelector('.eitem.sel');
  if(emailEl){emailEl.classList.add('done');emailEl.classList.remove('sel','unread');}
  GS.active=false;setSim('READY');setStep(0);clearGlows();
}

// ── RESULTS ───────────────────────────────────────────────────
function showResults(savedId){
  const mod=MODULES[savedId],sc=GS.scenario;
  if(!mod||!sc)return;
  const pl=mod.plenary||{};

  // ── Score the run ──
  const total=sc.length;
  const correct=sc.filter(it=>it.userAction===it.actionAnswer).length;
  const pct=total?Math.round(correct/total*100):0;
  const grade=pct>=90?'EXCELLENT':pct>=70?'STRONG':pct>=50?'DEVELOPING':'NEEDS REVIEW';
  const gradeCol=pct>=90?'#00ff99':pct>=70?'var(--g)':pct>=50?'var(--amb)':'var(--red)';

  let h='';

  // ── HERO: case summary ──
  h+='<div class="db-hero">';
  h+=  '<div class="db-hero-tag">CASE CLOSED // MISSION '+GS.round+'</div>';
  h+=  '<div class="db-hero-name">'+esc(mod.name)+'</div>';
  h+=  '<div class="db-hero-stats">';
  h+=    '<div class="db-stat"><div class="db-stat-num" style="color:'+gradeCol+'">'+correct+'/'+total+'</div><div class="db-stat-lbl">ALERTS CORRECT</div></div>';
  h+=    '<div class="db-stat"><div class="db-stat-num" style="color:'+gradeCol+'">'+pct+'%</div><div class="db-stat-lbl">ACCURACY</div></div>';
  h+=    '<div class="db-stat"><div class="db-stat-grade" style="color:'+gradeCol+';border-color:'+gradeCol+'">'+grade+'</div></div>';
  h+=  '</div>';
  h+='</div>';

  // ── ALERT-BY-ALERT VERDICTS ──
  h+='<div class="db-sec-lbl">ALERT VERDICTS</div>';
  sc.forEach(item=>{
    const ao=(item.userAction===item.actionAnswer);
    const ragCol=item.ragAnswer==='R'?'var(--red)':item.ragAnswer==='A'?'var(--amb)':'var(--g)';
    const ragTxt=item.ragAnswer==='R'?'THREAT':item.ragAnswer==='A'?'SUSPICIOUS':'BENIGN';
    h+='<div class="db-verdict '+(ao?'v-ok':'v-bad')+'">';
    h+=  '<div class="db-v-icon">'+(ao?'✓':'✗')+'</div>';
    h+=  '<div class="db-v-body">';
    h+=    '<div class="db-v-head"><span class="db-v-name">'+esc(item.name)+'</span>'+
           '<span class="db-v-rag" style="color:'+ragCol+';border-color:'+ragCol+'">'+ragTxt+'</span></div>';
    if(ao){
      h+=  '<div class="db-v-line">Correctly actioned: <b>'+esc(item.userAction||'—')+'</b></div>';
    } else {
      h+=  '<div class="db-v-line">You chose <b class="bad">'+esc(item.userAction||'—')+'</b> · correct was <b class="good">'+esc(item.actionAnswer)+'</b></div>';
    }
    if(item.notes) h+='<div class="db-v-note">'+esc(item.notes)+'</div>';
    h+=  '</div>';
    h+='</div>';
  });

  // ── INCIDENT REPORT (rich HTML from module, NOT escaped) ──
  if(typeof mod.completionText==='function'){
    h+='<div class="db-sec-lbl">INCIDENT REPORT</div>';
    h+='<div class="db-report">'+mod.completionText('x',sc)+'</div>';
  }

  // ── TEAM ROUTING QUESTION ──
  const rt=mod.reportTeams;
  if(rt&&rt.correct){
    // Build wrong options
    var teamOpts=[rt.correct,rt.incorrect].filter(Boolean);
    // shuffle
    for(var i=teamOpts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=teamOpts[i];teamOpts[i]=teamOpts[j];teamOpts[j]=t;}
    h+='<div class="db-sec-lbl">ESCALATION ROUTING</div>';
    h+='<div class="db-route">';
    if(pl.reportHint) h+='<div class="db-route-hint">💡 '+esc(pl.reportHint)+'</div>';
    h+='<div class="db-route-q">Which team should this incident be escalated to?</div>';
    h+='<div id="dbRouteOpts">';
    teamOpts.forEach(function(opt){
      var isCorrect=(opt===rt.correct);
      h+='<button class="db-route-opt" data-correct="'+(isCorrect?'1':'0')+'" onclick="_dbRoute(this,'+(isCorrect?'true':'false')+')">'+esc(opt)+'</button>';
    });
    h+='</div></div>';
  }

  // ── EXAM QUIZ ──
  var quiz=(pl.quiz||[]).slice();
  for(var i=quiz.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=quiz[i];quiz[i]=quiz[j];quiz[j]=t;}
  var qSel=quiz.slice(0,3);
  if(qSel.length){
    h+='<div class="db-sec-lbl">EXAM PRACTICE</div>';
    h+='<div class="db-quiz" id="dbQuiz">';
    qSel.forEach(function(q,qi){
      h+='<div class="db-q" id="dbQ'+qi+'">';
      h+=  '<div class="db-q-text"><span class="db-q-num">Q'+(qi+1)+'</span>'+esc(q.q)+'</div>';
      q.options.forEach(function(opt,oi){
        h+='<button class="db-q-opt" data-qi="'+qi+'" data-oi="'+oi+'" onclick="_dbQuizPick('+qi+','+oi+','+q.correct+')">'+esc(opt)+'</button>';
      });
      h+='</div>';
    });
    h+='</div>';
    h+='<button class="db-submit" id="dbSubmit" onclick="_dbQuizSubmit('+qSel.length+')">SUBMIT EXAM ANSWERS</button>';
  }

  h+='<div id="dbEndSlot"></div>';
  if(!qSel.length) h+='<button class="db-submit" style="margin-top:16px;" onclick="_nextCase()">NEXT CASE &rarr;</button>';

  document.getElementById('resultsView').innerHTML=h;
  showTab('R');

  // ── interaction state ──
  window._dbQuizAns={};
  window._dbRouteDone=false;

  window._dbRoute=function(btn,isCorrect){
    if(window._dbRouteDone)return;
    window._dbRouteDone=true;
    document.querySelectorAll('.db-route-opt').forEach(function(b){b.disabled=true;b.classList.add('dim');});
    btn.classList.remove('dim');
    if(isCorrect){btn.classList.add('route-ok');addXP(20);try{SFX.correct&&SFX.correct();}catch(e){}}
    else{
      btn.classList.add('route-bad');addXP(-10);try{SFX.wrong&&SFX.wrong();}catch(e){}
      document.querySelectorAll('.db-route-opt').forEach(function(b){
        if(b.dataset.correct==='1'){b.classList.remove('dim');b.classList.add('route-ok');}
      });
    }
  };

  window._dbQuizPick=function(qi,oi,correct){
    if(window._dbQuizSubmitted)return;
    window._dbQuizAns[qi]={chosen:oi,correct:correct};
    var qel=document.getElementById('dbQ'+qi);
    if(qel)qel.querySelectorAll('.db-q-opt').forEach(function(b){
      b.classList.toggle('picked',parseInt(b.dataset.oi)===oi);
    });
  };

  window._dbQuizSubmit=function(tot){
    if(window._dbQuizSubmitted)return;
    window._dbQuizSubmitted=true;
    var score=0;
    for(var i=0;i<tot;i++){
      var a=window._dbQuizAns[i];var qel=document.getElementById('dbQ'+i);if(!qel)continue;
      if(a&&a.chosen===a.correct)score++;
      qel.querySelectorAll('.db-q-opt').forEach(function(b){
        var oi=parseInt(b.dataset.oi);b.disabled=true;b.classList.remove('picked');
        if(a&&oi===a.correct)b.classList.add('q-ok');
        else if(a&&oi===a.chosen)b.classList.add('q-bad');
        else b.classList.add('dim');
      });
    }
    var xp=score*25;if(xp)addXP(xp);
    var sub=document.getElementById('dbSubmit');
    var sc=score===tot?'#00ff99':score>=tot/2?'var(--g)':'var(--amb)';
    if(sub){
      sub.outerHTML='<div class="db-quiz-result"><div class="db-qr-score" style="color:'+sc+'">'+score+'/'+tot+' correct</div>'+
        (xp?'<div class="db-qr-xp">+'+xp+' XP</div>':'')+'</div>'+
        '<button class="db-submit" style="margin-top:16px;" onclick="_nextCase()">NEXT CASE &rarr;</button>';
    }
    GS.quizCorrect=(GS.quizCorrect||0)+score;
    GS.quizTotal=(GS.quizTotal||0)+tot;
  };

  // record once at debrief open
  recordModuleResult(savedId,sc,0);
}


// ── DDOS GRAPH ────────────────────────────────────────────────
function animGraph(data,base,cur){
  const cv=document.getElementById('graphCanvas');if(!cv)return;
  if(GS.gfr){cancelAnimationFrame(GS.gfr);GS.gfr=null;}
  let prog=0;const pts=data.length,bad=cur>base*3;
  function f(){
    const ctx=cv.getContext('2d');const w=cv.clientWidth,h=cv.clientHeight;
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
    ctx.clearRect(0,0,w,h);const mx=Math.max(...data,base)*1.15;
    ctx.strokeStyle='rgba(0,255,65,.07)';ctx.lineWidth=.5;
    for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,i/4*h);ctx.lineTo(w,i/4*h);ctx.stroke();}
    const by=h-(base/mx)*h*.9-4;
    ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(0,255,65,.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,by);ctx.lineTo(w,by);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(0,255,65,.4)';ctx.font='9px Share Tech Mono';ctx.fillText('AVG: '+base.toLocaleString(),4,by-3);
    const n=Math.max(2,Math.round(prog*pts));
    ctx.beginPath();
    data.slice(0,n).forEach((v,i)=>{const x=(i/(pts-1))*w,y=h-(v/mx)*h*.9-4;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.strokeStyle=bad?'#ff0040':'#00ff41';ctx.lineWidth=2;ctx.shadowColor=bad?'#ff0040':'#00ff41';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
    const lx=((n-1)/(pts-1))*w;ctx.lineTo(lx,h);ctx.lineTo(0,h);ctx.fillStyle=bad?'rgba(255,0,64,.06)':'rgba(0,255,65,.04)';ctx.fill();
    if(prog<1){prog=Math.min(1,prog+.04);GS.gfr=requestAnimationFrame(f);}
  }
  GS.gfr=requestAnimationFrame(f);
}


function loadPhish(){}  // phishing exception removed
function loadIPTrace(){ return; }  // IP trace removed
function startTrace(){ return; }
function endTrace(){ return; }
function showIPRetryModal(){ return; }
function retryIPTrace(){ return; }
function declineRetryIPTrace(){ return; }
function closeIPTrace(){ return; }
function presentHopChallenge(){ return; }
function advanceHop(){ return; }
function flashHop(h, f, cb){ if(cb) setTimeout(cb, 50); }
function triggerTraceGlitch(cb){ if(cb) setTimeout(cb, 100); }
function startMapPulse(){}
function stopMapPulse(){}
function startIPCountdown(){}
function genHops(){ return []; }
var CITIES=[];


// ── ENDGAME — delegates to gamification.js ──────────────────────
function showEndgame(){
  showEndSplash();
}

function resetAll(){
  /*vox*/clearTimeout(GS.autoTimer);clearTimeout(GS.stuckTimer);
  var _elendOverlay=document.getElementById('endOverlay');if(_elendOverlay)_elendOverlay.classList.remove('open');
  var _elendSplash=document.getElementById('endSplash');if(_elendSplash)_elendSplash.classList.remove('open');
  var _elipOverlay=document.getElementById('ipOverlay');if(_elipOverlay)_elipOverlay.classList.remove('open');
  var _elplenaryModal=document.getElementById('plenaryModal');if(_elplenaryModal)_elplenaryModal.classList.remove('open');
  document.body.classList.remove('alert-mode');
  GS.briefingsSeen=new Set();
  GS.howToPlaySeen=false;
  Object.assign(GS,{hearts:GS.maxH,xp:0,round:0,modId:null,scenario:null,correctTool:null,toolOk:false,reportReady:false,active:false,phishDone:false,ipDone:false,difficulty:1,preBriefDone:new Set(),shownHints:new Set(),lastHintTime:0,queue:[],forceMod:null,badTools:0,sessId:uid(),scenarioRagDone:true,ip:{},gfr:null,autoTimer:null,stuckTimer:null,stuckStep:0,pendingEmail:null,debriefModId:null,plenReportDone:false,plenQuizAnswered:0,plenQuizTotal:0,quizCorrect:0,quizTotal:0,phishReported:false,ipWon:false,livesLost:0,difficulty:1,preBriefDone:new Set(),shownHints:new Set(),lastHintTime:0,difficulty:1,preBriefDone:new Set(),shownHints:new Set(),lastHintTime:0,selectedEmailId:null,emailOpened:false,briefingsSeen:new Set(),stuckCount:0,stuckTimer:null,sessionFlags:{allGreenUsed:false,highEscalationUsed:false,lastWasLow:false}});
  rHearts();rXP();rRound();
  document.getElementById('ilist').innerHTML=`<div id="ilistEmpty" style="padding:16px;font-size:15px;color:rgba(0,255,65,.35);text-align:center;line-height:2.4;">No alerts yet.<br><span style="color:var(--g);font-size:14px;">▲ Check the alert queue above to begin.</span></div>`;
  document.getElementById('welcomeMsg').style.display='block';document.getElementById('emailView').style.display='none';
  document.getElementById('resultsView').innerHTML='Results appear here after each mission.';
  document.getElementById('chatMsgs').innerHTML='';
  resetTool();clearGlows();
  document.getElementById('toolSel').value='';
  var tgr=document.getElementById('toolGrid');
  if(tgr)tgr.innerHTML='<div class="tt-placeholder">📧 Open an alert email to reveal available tools</div>';
  var tp=document.getElementById('toolPanel');if(tp)tp.classList.remove('active-tool');
  document.getElementById('scenProg').textContent='';
  document.getElementById('chatMsgs').innerHTML='';
  setSim('READY');setStep(0);
  // Re-pulse the refresh button to guide child
  document.getElementById('btnRefresh').classList.add('pulse-glow');
  gcMsg('zara', pick(GENERAL_GROUP_CHAT.welcome[0].msgs),600);
  gcMsg('marcus',pick(GENERAL_GROUP_CHAT.welcome[1].msgs),4000);
}

// ── UTILS ─────────────────────────────────────────────────────
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escA(s){return esc(s).replace(/'/g,'&#39;');}
