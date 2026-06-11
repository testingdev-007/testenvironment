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
const SESSION_HISTORY = {
  modulesUsed: new Set(),      // module IDs shown this page load
  quizShown:   {},             // { moduleId: Set of question indices shown }
  scenarioKeys: new Set(),     // 'modId_numEsc_type' — avoid identical patterns
};

const GS = {
  maxH:3, hearts:3, xp:0,
  round:0, totalRounds:4,
  modId:null, scenario:null,
  correctTool:null, toolOk:false,
  reportReady:false,
  active:false,
  phishDone:false, ipDone:false,
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
  const modal=document.getElementById('welcomeModal');
  if(modal){
    modal.style.transition='opacity .6s ease';
    modal.style.opacity='0';
    setTimeout(()=>{modal.style.display='none';},600);
  }
  // Play startup sound after brief delay
  setTimeout(()=>{try{SFX.newMail();}catch(ex){}},400);
}

function askReset(){
  document.getElementById('resetConfirm').classList.add('open');
}
function confirmReset(){
  document.getElementById('resetConfirm').classList.remove('open');
  resetAll();
}

// ── BOOT ──────────────────────────────────────────────────────
function _boot(){
  initMatrix();
  rHearts();rXP();rRound();setStep(0);
  document.getElementById('btnRefresh').classList.add('pulse-glow');
  gcMsg('zara',  pick(GENERAL_GROUP_CHAT.welcome[0].msgs),700);
  gcMsg('marcus',pick(GENERAL_GROUP_CHAT.welcome[1].msgs),4000);
  gcMsg('priya', pick(GENERAL_GROUP_CHAT.welcome[2].msgs),8000);
  idleLoop();
}
// Handles both normal <script> loading and dynamic loading via loader.js
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',_boot);
} else {
  setTimeout(_boot,0);
}

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
function rHearts(){
  const el=document.getElementById('heartsEl');el.innerHTML='';
  for(let i=0;i<GS.maxH;i++){const s=document.createElement('span');s.className='heart'+(i>=GS.hearts?' lost':'');s.textContent='❤';el.appendChild(s);}
}
function loseH(why){try{SFX.wrong();}catch(e){}GS.livesLost=(GS.livesLost||0)+1;if(GS.hearts<=1){toast('Hanging on!','bad');return;}GS.hearts=Math.max(1,GS.hearts-1);rHearts();toast('-1 ❤  '+why,'bad');}
function rXP(){document.getElementById('xpNum').textContent=GS.xp;document.getElementById('xpFill').style.width=Math.min(100,(GS.xp/500)*100)+'%';}
function addXP(n){if(!n)return;GS.xp=Math.max(0,GS.xp+n);rXP();toast(n>0?'+'+n+' XP ✦':n+' XP',n>0?'ok':'bad');}
function rRound(){document.getElementById('roundNum').textContent=GS.round+'/'+GS.totalRounds;}
function setSim(t){document.getElementById('simStatus').textContent=t;}
function toast(msg,type='ok'){const el=document.getElementById('toast');el.textContent=msg;el.className='show '+type;clearTimeout(el._t);el._t=setTimeout(()=>{el.className='';},3000);}

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
    1:["Can you see your email? Click it, then press OPEN IT to read it!","Click the email in the list on the left — then press the OPEN IT button!"],
    2:["Now pick a tool from the dropdown above the data area and click LOAD TOOL. Look at your email — what kind of attack is it?","Hint: your email tells you the type of attack. Pick the tool that matches!"],
    3:["Look at each card — what do the numbers tell you? Click the buttons to decide what to do!","Check each item. Big spike = Red, a bit high = Amber, looks normal = Green."],
    4:["Click the action buttons on each card. You're nearly done!","For each card, pick Block, Quarantine, or Ignore based on how serious it looks."],
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
  if(GS.active){toast('Finish your current mission first!','warn');return;}
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
  try{SFX.newMail();}catch(e){}/*vox*/clearTimeout(GS.autoTimer);
  document.getElementById('btnRefresh').classList.remove('pulse-glow');
  if(GS.active){toast('Finish your current mission first!','warn');return;}
  // Reset email/results pane for fresh mission
  document.getElementById('welcomeMsg').style.display='block';
  document.getElementById('emailView').style.display='none';
  showTab('E');
  clearEmailActionBar();
  // Only show endgame when ALL rounds done AND no exceptions left in queue
  if(GS.round>=GS.totalRounds&&!GS.queue.length){showEndgame();return;}
  if(GS.forceMod){const m=GS.forceMod;GS.forceMod=null;dispatchMod(m);return;}
  if(!GS.queue.length)buildQueue();
  dispatchMod(GS.queue.shift());
}
function dispatchMod(id){
  if(id==='__phish__')  loadPhish();
  else if(id==='__iptrace__') loadIPTrace();
  else loadModule(id);
}
function buildQueue(){
  // Prefer modules not yet seen this page session — reduces repetition on reset
  const unseen=MODULE_LIST.filter(m=>!SESSION_HISTORY.modulesUsed.has(m));
  const pool=unseen.length>=GS.totalRounds?unseen:MODULE_LIST;
  const mods=shuffle(pool).slice(0,GS.totalRounds);
  mods.forEach(m=>SESSION_HISTORY.modulesUsed.add(m));
  // BOTH exceptions are guaranteed every session — always inserted at random positions
  mods.splice(randInt(0,mods.length),0,'__phish__');
  let p=randInt(0,mods.length);
  while(mods[p]==='__phish__')p=randInt(0,mods.length); // don't stack next to each other
  mods.splice(p,0,'__iptrace__');
  GS.queue=mods;
}
function schedAutoAdvance(delay=18000){
  clearTimeout(GS.autoTimer);
  // Keep going while there are rounds left OR exceptions still in the queue
  const moreToGo=GS.round<GS.totalRounds||GS.queue.length>0;
  if(!GS.active&&moreToGo){
    GS.autoTimer=setTimeout(()=>{
      if(!GS.active&&(GS.round<GS.totalRounds||GS.queue.length>0)){
        gcMsg('marcus',pick(['New email just arrived — get ready!','Heads up, another case just landed!','Fresh one in the inbox!']));
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
    return {numEscalations:0,escalationType:'none',includeEdgeCase:false,numItems:6};
  }
  // High escalation: once per game, not first round
  if(!f.highEscalationUsed && r>=2 && Math.random()>.55){
    f.highEscalationUsed=true;
    return {numEscalations:randInt(3,4),escalationType:pick(['RED_RED_AMBER','RED_RED_RED','RED_AMBER_AMBER']),includeEdgeCase:true,numItems:7};
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
  return {numEscalations:numE,escalationType:escalType,includeEdgeCase:Math.random()>.3,numItems:6};
}

// ── LOAD MODULE ───────────────────────────────────────────────
function loadModule(id){
  const mod=MODULES[id];if(!mod)return;
  // Guard: close any stale plenary, clear chat for fresh mission
  document.getElementById('plenaryModal').classList.remove('open');
  GS.debriefModId=null;GS.plenReportDone=false;GS.plenQuizAnswered=0;GS.plenQuizTotal=0;
  GS.emailOpened=false;
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
  const toolSel=document.getElementById('toolSel');
  toolSel.innerHTML='<option value="">— Pick an investigation tool —</option>';
  getToolOptions(id).forEach(t=>{const o=document.createElement('option');o.value=t;o.textContent=t;toolSel.appendChild(o);});
  const email={id:Date.now(),sender:mod.emailSender(),subject:mod.emailSubject(),body:mod.emailBody(GS.scenario),modId:id,phish:false};
  GS.pendingEmail=email;
  addToInbox(email);
  setTimeout(()=>gcModLoad(id),800);
}

function resetTool(){
  if(GS.gfr){cancelAnimationFrame(GS.gfr);GS.gfr=null;}
  document.getElementById('graphCanvas').style.display='none';
  document.getElementById('toolData').innerHTML='<div class="tph">📧 Read your email first — then pick the right tool above and click <strong>▶ LOAD TOOL</strong>!</div>';
  document.getElementById('toolBar').innerHTML='<span class="bhint">👈 Your email tells you what kind of attack it is. That\'s the clue for picking your tool!</span>';
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
  // Select and highlight in inbox (buttons enabled), but do NOT auto-open email pane
  setTimeout(()=>selectInboxEmail(email.id, email),350);
  // Team chat hint for phishing emails
  if(email.phish){setTimeout(()=>{const e2=pick(PHISHING_EXCEPTION_CHAT.onPhishingArrived);gcMsg(e2.persona,pick(e2.msgs));},1800);}
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
      toast('This looks like a genuine email — no need to report it!','warn');
    }
  }
}

function showEmailContent(email){
  GS.emailOpened=true;
  document.getElementById('welcomeMsg').style.display='none';
  const v=document.getElementById('emailView');v.style.display='block';
  v.innerHTML=`<div class="evmeta">
    <div class="evlbl">FROM</div><div class="evval">${esc(email.sender)}</div>
    <div class="evlbl">SUBJECT</div><div class="evval evbig">${esc(email.subject)}</div>
  </div><div class="evbody">${esc(email.body)}</div>`;
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
      v.innerHTML=`<div class="evmeta"><div class="evlbl">RESULT</div><div class="evval cR">❌ That was a fake email!</div></div>
        <div class="evbody">In real life, clicking it could put malware on your computer or steal your password.\n\nSpot the tricks: weird spellings (go0gle.com), scary urgent language, links to strange websites.\n\nIf it looks weird — REPORT it, don't open it!</div>`;
    } else {
      addXP(30);GS.phishReported=true;
      const e=pick(PHISHING_EXCEPTION_CHAT.onReported);gcMsg(e.persona,pick(e.msgs));
      toast('✓ Great spotting — fake email reported!','ok');
      const v=document.getElementById('emailView');v.style.display='block';
      v.innerHTML=`<div class="evmeta"><div class="evlbl">RESULT</div><div class="evval cG">✓ Fake email caught! 🎯</div></div>
        <div class="evbody">You spotted the fake address and reported it — exactly right!\n\nFake emails use tricks like:\n• Letters swapped for numbers (paypa1.com)\n• Wrong domain (company.helpdesk.xyz)\n• Scary urgent language to make you panic\n\nAlways check before you click!</div>`;
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
  if(!GS.emailOpened){toast('Open your email first! 👆','warn');return;}
  const v=document.getElementById('toolSel').value;
  if(!v){toast('Pick a tool first!','warn');return;}
  if(!GS.active){toast('No scenario active','warn');return;}
  if(GS.toolOk){toast('Tool already loaded','warn');return;}
  if(v===GS.correctTool){
    GS.toolOk=true;GS.badTools=0;addXP(10);
    gcMod(GS.modId,'onToolCorrect');
    toast('✓ Correct tool loaded!','ok');
    /*vox*/;
    GS.scenarioRagDone=true;
    renderToolData();setStep(3);
    SFX.correct();
  } else {
    GS.badTools++;loseH('Wrong tool');addXP(-5);gcMod(GS.modId,'onToolWrong');/*vox*/;
    const hint=GS.badTools>=2?'<br><br><em>Hint: your email tells you what type of attack it is — which tool matches?</em>':'';
    document.getElementById('toolData').innerHTML=`<div class="terr">✗ <strong>${esc(v)}</strong> isn't the right tool for this.${hint}<br><br>Have another look and try again!</div>`;
  }
}


// ── LEGENDS — quick reference above data cards ─────────────────
const MODULE_LEGENDS = {
  ddos:           '🔴 Over 10× normal → Block   🟡 3–10× normal → Slow it down   🟢 Normal → Leave it',
  malware:        '🔴 Unknown program → Quarantine   🟡 Real but acting odd → Investigate   🟢 Known & normal → Leave it',
  ransomware:     '🔴 Bad extension + lots encrypted → Isolate   🟡 Suspicious extension, few files → Investigate   🟢 Normal → Leave it',
  phishingModule: '🔴 Fake address → Report   🟢 Real address → Deliver it',
  bruteForce:     '🔴 Very fast + very few IPs → Lock   🟡 Suspicious pattern → Investigate   🟢 Normal typos → Leave it',
};

// ── RENDER TABLE (card layout) ─────────────────────────────────
function renderToolData(){
  const id=GS.modId,sc=GS.scenario,cols=MODULE_COLUMNS[id];
  // Legend strip at top
  const legend=MODULE_LEGENDS[id]||'';
  let html=legend?`<div class="legend-strip">${esc(legend)}</div>`:'';
  sc.forEach((item,i)=>{
    const done=item.handled;
    const borderCol=done?(item.ragAnswer==='R'?'var(--red)':item.ragAnswer==='A'?'var(--amb)':'var(--g)'):'rgba(0,255,65,0.18)';
    html+=`<div class="dcard${done?' done':''}" id="dr${i}" style="border-left:4px solid ${borderCol}" onclick="cardClicked(${i})">`;
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
      html+=`<div class="dval"><span class="dval-lbl">${c.label}</span><span class="dval-v" style="${valStyle}">${esc(String(v))}</span></div>`;
    });
    html+=`</div>`;
    if(item.notes){html+=`<div class="dcard-note">${esc(item.notes)}</div>`;}
    if(!done&&GS.scenarioRagDone){
      html+=`<div class="dcard-actions">`;
      (MODULE_ACTIONS[id]||[]).forEach(a=>{
        const cls=a.id==='block'||a.id==='quarantine'||a.id==='isolate'||a.id==='lockAccount'||a.id==='report'?'btn-r':
                  a.id==='ignore'?'btn-d':'btn-a';
        html+=`<button class="btn btn-sm ${cls}" onclick="doAction(${i},'${a.id}')">${a.label}</button>`;
      });
      html+=`</div>`;
    } else if(done){
      const ok=item.userAction===item.actionAnswer;
      html+=`<div class="dcard-done-info">${ok?'✓ '+item.userAction:'✗ You said: '+item.userAction+' | Correct: '+item.actionAnswer}</div>`;
    }
    html+=`</div>`;
  });
  document.getElementById('toolData').innerHTML=html;
  if(id==='ddos'){
    document.getElementById('graphCanvas').style.display='block';
    // Auto-show first item's graph immediately
    const first=GS.scenario&&GS.scenario[0];
    if(first&&first.graphData) setTimeout(()=>animGraph(first.graphData,first.avgHitsMin,first.currentHitsMin),300);
  }
  updBar();
}

function cardClicked(idx){
  const item=GS.scenario&&GS.scenario[idx];
  if(!item)return;
  if(GS.modId==='ddos'&&item.graphData&&item.avgHitsMin){
    animGraph(item.graphData,item.avgHitsMin,item.currentHitsMin);
  }
}

function doAction(rowIdx,actId){
  const item=GS.scenario[rowIdx];
  if(!item||item.handled){toast('Already handled!','warn');return;}
  item.handled=true;
  item.userAction=actId;
  const ao=(actId===item.actionAnswer);
  if(ao){try{SFX.correct();}catch(e){}/*vox*/addXP(15);gcMod(GS.modId,'onActionCorrect',200);}
  else{loseH('Wrong action');addXP(-5);/*vox*/gcMod(GS.modId,'onActionWrong',200);}
  // DDoS graph
  if(GS.modId==='ddos'&&item.graphData)animGraph(item.graphData,item.avgHitsMin,item.currentHitsMin);
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
  if(!GS.toolOk){bar.innerHTML='<span class="bhint">👆 Pick a tool from the dropdown above and click LOAD TOOL!</span>';return;}
  if(GS.reportReady){renderDebriefButton();return;}
  const all=GS.scenario&&GS.scenario.every(s=>s.handled);
  if(all)bar.innerHTML='<span class="bhint">✅ All done! Click the button below to see your debrief!</span>';
  else bar.innerHTML='<span class="bhint">👆 Click each card and choose what to do!</span>';
}

// ── DEBRIEF BUTTON (replaces old report bar) ──────────────────
function renderDebriefButton(){
  document.getElementById('toolBar').innerHTML=
    `<button class="btn btn-g btn-orb" style="flex:1;padding:12px;font-size:14px;letter-spacing:1px;" onclick="openDebrief()">📋 MISSION DEBRIEF &amp; REPORT →</button>`;
}

// Opened by child clicking the debrief button — captures modId RIGHT NOW, no timer race
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
  showPlenary(savedId,savedScenario);
}

// Legacy doReport kept only as internal helper called by plenReport()
function doReport(ok,correct,savedId){
  if(ok){try{SFX.correct();}catch(e){}/*vox*/addXP(30);gcMod(savedId,'reportCorrect');}
  else{loseH('Wrong team');addXP(-15);/*vox*/gcMod(savedId,'reportWrong');}
}

// ── RESULTS ───────────────────────────────────────────────────
function showResults(savedId){
  const mod=MODULES[savedId],sc=GS.scenario;
  if(!mod||!sc)return;
  let h=`<div class="rtit">${esc(mod.name)}</div><div class="rmod" style="font-size:13px;color:var(--cyn);margin-bottom:12px;">MISSION ${GS.round} COMPLETE</div>`;
  sc.forEach(item=>{
    const ao=(item.userAction===item.actionAnswer);
    const extra=(savedId==='phishingModule'&&item.clue&&item.isPhish)?`<div class="rnote" style="color:var(--amb);">👀 The clue: ${esc(item.clue)}</div>`:'';
    h+=`<div class="rc ${ao?'ok':'bad'}"><h3>${ao?'✓':'✗'} ${esc(item.name)}</h3>
      ${extra}
      <div class="rr"><span>Correct:</span><code>${item.actionAnswer}</code></div>
      <div class="rr"><span>You said:</span><code>${item.userAction||'?'}</code></div>
      <div class="rnote">${esc(item.notes||'')}</div></div>`;
  });
  h+=mod.completionText('x',sc);
  // Report result appended later by plenReport() once answered
  h+=`<div id="reportResultSlot"></div>`;
  document.getElementById('resultsView').innerHTML=h;showTab('R');
  // endgame triggered by closePlenary() after quiz completes — not here
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

// ── PHISHING EXCEPTION (does NOT count as a round) ────────────
// Large pool of varied phishing scenarios — different tells each time
const PHISH_POOL = [
  // Typo domains — letter swap
  { domain:'go0gle.com',     real:'google.com',     subjects:['URGENT: Google Account Suspended','Security Alert: Unusual Sign-In','Your Google Account Needs Verification'], body:(d)=>`Dear Google User,\n\nWe detected suspicious activity on your Google account. Your account will be permanently deleted in 24 hours unless you verify your identity:\n\nhttp://accounts.${d}/verify\n\nGoogle Security Team` },
  { domain:'micros0ft.com',  real:'microsoft.com',  subjects:['Microsoft 365: Your Licence Has Expired','Action Required: Verify Your Microsoft Account','Your OneDrive Has Been Locked'], body:(d)=>`Dear User,\n\nYour Microsoft 365 licence has expired. To avoid losing access to your files and email, please renew immediately:\n\nhttp://account.${d}/renew\n\n— Microsoft Support` },
  { domain:'arnazon.co.uk',  real:'amazon.co.uk',   subjects:['Your Amazon Order Has Been Cancelled','Prime Membership Renewal Failed','Unusual Activity on Your Account'], body:(d)=>`Dear Customer,\n\nWe were unable to process your recent payment. Your account has been temporarily suspended. To restore access:\n\nhttp://signin.${d}/restore\n\n— Amazon` },
  { domain:'paypa1.com',     real:'paypal.com',     subjects:['PayPal: Suspicious Activity Detected','Your PayPal Account Has Been Limited','Action Required: Confirm Your Identity'], body:(d)=>`Dear PayPal Customer,\n\nWe noticed unusual activity on your account. To protect you, we\'ve temporarily limited your account.\n\nResolve here: http://secure.${d}/resolve\n\n— PayPal Security` },
  { domain:'netfl1x.com',    real:'netflix.com',    subjects:['Netflix: Payment Failed','Your Netflix Account Has Been Suspended','Update Your Netflix Payment Details'], body:(d)=>`Dear Member,\n\nWe were unable to process your latest payment. Your account will be suspended tonight unless you update your billing information:\n\nhttp://${d}/update-payment\n\n— Netflix` },
  { domain:'app1e.com',      real:'apple.com',      subjects:['Apple ID: Sign-In Attempt From New Device','Your Apple ID Has Been Locked','iCloud Storage Full — Upgrade Now'], body:(d)=>`Dear Apple Customer,\n\nYour Apple ID was used to sign in from a new device in an unusual location. If this wasn\'t you, secure your account now:\n\nhttp://appleid.${d}/verify\n\n— Apple Support` },
  { domain:'bbc-alerts.net', real:'bbc.co.uk',      subjects:['BBC: Update Your Subscription Details','BBC iPlayer: Action Required'], body:(d)=>`Dear BBC Viewer,\n\nYour BBC account requires re-verification. Please confirm your details to continue accessing BBC iPlayer:\n\nhttp://${d}/verify\n\n— BBC Team` },
  // Completely wrong domain
  { domain:'company.helpdesk.xyz', real:'company.com', subjects:['Your Password Expires in 1 Hour — Reset Now','URGENT: Account Access Suspended'], body:(d)=>`Dear Employee,\n\nYour network password is due to expire. To avoid being locked out, reset it immediately:\n\nhttp://${d}/password-reset\n\nIT Support` },
  { domain:'company-portal.info',  real:'company.com', subjects:['HR: Important Update to Your Employment Record','Payroll: Direct Debit Change Required'], body:(d)=>`Dear Team Member,\n\nHR requires you to update your personal details in our system. Please log in and confirm your information by end of day:\n\nhttp://${d}/update\n\nHR Department` },
  // CEO fraud
  { domain:'company-ceo.net', real:'company.com', subjects:['Confidential — Please Handle Urgently','Quick Favour — Confidential'], body:(d)=>`Hi,\n\nI need your help with something urgent and confidential. I\'m in a meeting but need you to arrange a bank transfer of £6,200 to a new supplier today.\n\nPlease don\'t discuss with anyone else — reply directly to me.\n\nThanks` },
  // Lookalike with extra characters
  { domain:'support-paypal.com',  real:'paypal.com',   subjects:['PayPal: Please Update Your Details','Your PayPal Balance Has Been Frozen'], body:(d)=>`Dear PayPal User,\n\nYour account has an issue that requires immediate attention. Please verify your account details to avoid suspension:\n\nhttp://${d}/verify\n\n— PayPal` },
  { domain:'amazon.customer-service.cc', real:'amazon.co.uk', subjects:['Amazon: Delivery Problem With Your Order','Your Package Could Not Be Delivered'], body:(d)=>`Dear Customer,\n\nWe attempted to deliver your parcel today but were unable to complete delivery. Please confirm your address and pay a small redelivery fee:\n\nhttp://${d}/redeliver\n\n— Amazon Delivery` },
];

function loadPhish(){
  const tmpl = pick(PHISH_POOL);
  const subject = pick(tmpl.subjects);
  const body = tmpl.body(tmpl.domain);
  // Vary the from-address format
  const fromPrefixes = ['noreply','security','alert','support','accounts','no-reply','info','service'];
  const sender = `${pick(fromPrefixes)}@${tmpl.domain}`;
  const email = {id:Date.now(), sender, subject, body, modId:null, phish:true};
  GS.active=true; GS.pendingEmail=email;
  setSim('⚠ SUSPICIOUS EMAIL');
  addToInbox(email);
  toast('New email — be careful before you act!','warn');
}

// ═══════════════════════════════════════════════════════════════
// IP TRACE — TACTICAL MAP + PER-HOP CHALLENGES
// Exception: does NOT count as a round
// ═══════════════════════════════════════════════════════════════

const CITIES=[
  {city:'London',      lat:51.5,  lon:-0.12, country:'UK'},
  {city:'Amsterdam',   lat:52.37, lon:4.89,  country:'NL'},
  {city:'Frankfurt',   lat:50.11, lon:8.68,  country:'DE'},
  {city:'Moscow',      lat:55.75, lon:37.62, country:'RU'},
  {city:'Beijing',     lat:39.9,  lon:116.4, country:'CN'},
  {city:'Seoul',       lat:37.57, lon:126.98,country:'KR'},
  {city:'Tokyo',       lat:35.68, lon:139.69,country:'JP'},
  {city:'São Paulo',   lat:-23.55,lon:-46.63,country:'BR'},
  {city:'Lagos',       lat:6.52,  lon:3.37,  country:'NG'},
  {city:'Kyiv',        lat:50.45, lon:30.52, country:'UA'},
  {city:'Tehran',      lat:35.69, lon:51.39, country:'IR'},
  {city:'Istanbul',    lat:41.01, lon:28.95, country:'TR'},
  {city:'Hanoi',       lat:21.03, lon:105.83,country:'VN'},
  {city:'Bucharest',   lat:44.43, lon:26.1,  country:'RO'},
  {city:'Nairobi',     lat:-1.29, lon:36.82, country:'KE'},
  {city:'Buenos Aires',lat:-34.6, lon:-58.38,country:'AR'},
  {city:'Dubai',       lat:25.2,  lon:55.27, country:'UAE'},
  {city:'Sydney',      lat:-33.87,lon:151.21,country:'AU'},
  {city:'Chicago',     lat:41.88, lon:-87.63,country:'US'},
  {city:'Johannesburg',lat:-26.2, lon:28.04, country:'ZA'},
];

// ─────────────────────────────────────────────────────────────────────
// TACTICAL MAP — 2D equirectangular projection radar-style display
// Nothing ever goes off-screen. IP always shown in fixed panel.
// ─────────────────────────────────────────────────────────────────────

// Continent polygons as [lon, lat] pairs for equirectangular projection


function startTrace(){
  document.getElementById('ipMode').style.display='none';
  document.getElementById('ipTrace').style.display='';
  document.getElementById('ipEasyOpts').style.display='none';
  document.getElementById('ipStat').textContent='';
  document.getElementById('ipCurrentIP').textContent='';
  document.getElementById('ipCurrentCity').textContent='Initialising trace…';

  const hopCount=Math.max(5,GS.maxH<=1?8:GS.maxH<=2?7:GS.maxH<=3?6:5);
  const hops=genHops(hopCount);
  GS.ip={hops,cur:-1,timer:60,done:false,ti:null,
         waitingForAnswer:false,currentChallengeHop:null,usedRetry:false};

  document.getElementById('ipTimer').textContent='60';
  document.getElementById('ipTimer').classList.remove('danger');
  try{SFX.bgStart();}catch(ex){}

  // 5-second countdown before trace begins
  document.getElementById('ipCurrentCity').textContent='Get ready — trace starting in 5!';
  let cd=5;
  const cdInt=setInterval(()=>{
    cd--;try{SFX.tick();}catch(ex){}
    if(cd>0){
      document.getElementById('ipCurrentCity').textContent='Get ready — '+cd+'!';
    } else {
      clearInterval(cdInt);
      startIPCountdown();
      GS.ip.cur=0;
      flashHop(hops[0],true,()=>{
        document.getElementById('ipHopInfo').textContent='HOP 1/'+hops.length+' — '+hops[0].city+', '+hops[0].country;
        presentHopChallenge(0);
      });
    }
  },1000);
}

function startIPCountdown(){
  const s=GS.ip;
  s.ti=setInterval(()=>{
    s.timer--;
    const el=document.getElementById('ipTimer');
    el.textContent=s.timer;
    if(s.timer<=15){el.classList.add('danger');try{SFX.tick();}catch(ex){};}
    if(s.timer===15){try{SFX.bgIntensify();}catch(ex){}}
    if(s.timer<=0){clearInterval(s.ti);endTrace(false,'Time ran out!');}
  },1000);
}

function advanceHop(){
  const s=GS.ip;if(s.done||s.cur>=s.hops.length-1)return;
  s.cur++;
  const hop=s.hops[s.cur];
  flashHop(hop,false,()=>{
    document.getElementById('ipHopInfo').textContent='HOP '+(s.cur+1)+'/'+s.hops.length+' — '+hop.city+', '+hop.country;
    const pool=IP_TRACE_CHAT.onHop;
    if(pool){const e=pick(pool);gcMsg(e.persona,pick(e.msgs));}
    presentHopChallenge(s.cur);
  });
}

function presentHopChallenge(hopIdx){
  try{SFX.sonar();}catch(ex){}
  const s=GS.ip;const hop=s.hops[hopIdx];
  s.waitingForAnswer=true;s.currentChallengeHop=hopIdx;
  s.hopStartTime=Date.now();
  const isFinal=(hopIdx===s.hops.length-1);

  document.getElementById('ipCurrentIP').textContent=hop.ip;
  document.getElementById('ipCurrentCity').textContent='📍 '+hop.city+', '+hop.country;

  const statMsg = isFinal ? '⚠ SOURCE FOUND! Lock them down!' :
                  hop.hard  ? '🧐 Read carefully — these are very similar!' :
                               '🛑 Pick the correct IP:';
  document.getElementById('ipStat').textContent=statMsg;

  const opts=buildHopOptions(hop);
  const cont=document.getElementById('ipEasyOpts');cont.innerHTML='';
  opts.forEach(ip=>{
    const b=document.createElement('button');
    b.className='ipeasy'+(hop.hard?' ipeasy-hard':'');
    b.textContent=ip;
    b.onclick=()=>handleHopAnswer(ip===hop.ip,hop,isFinal);
    cont.appendChild(b);
  });
  document.getElementById('ipEasyOpts').style.display='flex';
  startMapPulse();
}

function handleHopAnswer(correct,hop,isFinal){
  stopMapPulse();
  document.getElementById('ipEasyOpts').innerHTML='';
  const s=GS.ip;
  const elapsed=Date.now()-(s.hopStartTime||0);

  if(!correct){
    clearInterval(s.ti);
    try{SFX.bgStop();}catch(ex){}
    // First failure: offer a retry; second failure: actually fail
    if(!s.usedRetry){
      showIPRetryModal('Wrong IP for '+hop.city+'! The correct answer was: '+hop.ip);
    } else {
      endTrace(false,'Wrong IP for '+hop.city+'! Correct was: '+hop.ip);
    }
    return;
  }

  s.waitingForAnswer=false;
  try{SFX.correct();}catch(ex){}

  if(isFinal){
    clearInterval(s.ti);
    try{SFX.bgStop();}catch(ex){}
    endTrace(true,'');
  } else {
    // Check if we should add more hops (student doing well, about to finish early)
    const hopsLeft = s.hops.length - 1 - s.cur;
    if(s.timer > 28 && hopsLeft <= 1 && s.hops.length < 10){
      const extras = genHops(2);
      s.hops.push(...extras);
      // Re-mark last 2 as hard
      s.hops.forEach((h,i) => { h.hard = i >= s.hops.length - 2; });
      gcMsg('priya',`⚡ They know we\'re onto them — rerouting through ${s.hops.length} servers now!`,200);
      gcMsg('marcus',`Clever hacker — but we\'re cleverer! ${s.hops.length} hops total. Don\'t lose them! 💻`,900);
    }
    if(elapsed<2000){
      triggerTraceGlitch(()=>advanceHop());
    } else {
      document.getElementById('ipStat').textContent='✓ Got them! Tracking next location…';
      setTimeout(()=>advanceHop(),400);
    }
  }
}

// Glitch effect — fires when child answers too quickly (under 2s)
// Story: the hacker spotted them and tried to throw off the trace
function triggerTraceGlitch(onResume){
  const statEl=document.getElementById('ipStat');
  const cityEl=document.getElementById('ipCurrentCity');
  const ipEl  =document.getElementById('ipCurrentIP');
  const duration=2500+Math.random()*1500; // 2.5–4 seconds

  statEl.style.color='var(--amb)';
  statEl.textContent='⚡ SIGNAL LOST — HACKER DETECTED TRACE!';
  cityEl.textContent='⚠ REROUTING…';
  try{SFX.alert();}catch(e){}

  // Rapidly flash scrambled IPs and messages
  let tick=0;
  const glitchInt=setInterval(()=>{
    tick++;
    ipEl.textContent = tick%2===0 ? '????.????' : rndIP();
    cityEl.textContent=tick%2===0 ? '⚠ REROUTING…' : '⚡ DECOY DETECTED…';
  },280);

  setTimeout(()=>{
    clearInterval(glitchInt);
    statEl.style.color='';
    statEl.textContent='✅ Signal restored — resuming trace…';
    cityEl.textContent='Back on track!';
    ipEl.textContent='—';
    setTimeout(()=>onResume(),600);
  },duration);
}

function rndIP(){return `${randInt(2,220)}.${randInt(0,254)}.${randInt(0,254)}.${randInt(1,254)}`;}

// ── IP TRACE OVERLAY ──────────────────────────────────────────
function loadIPTrace(){
  try{SFX.alert();}catch(e){}
  document.body.classList.add('alert-mode');setSim('🔴 INTRUSION DETECTED');
  GS.active=true;
  const e1=pick(IP_TRACE_CHAT.onStart);gcMsg(e1.persona,pick(e1.msgs),400);
  setTimeout(()=>{const e2=pick(IP_TRACE_CHAT.onStart);gcMsg(e2.persona,pick(e2.msgs));},3200);
  document.getElementById('ipMode').style.display='';
  document.getElementById('ipTrace').style.display='none';
  document.getElementById('ipResult').style.display='none';
  document.getElementById('ipOverlay').classList.add('open');
  // Initialise the Three.js globe (defined in globe.js)
  drawTacticalMapIdle();
}

function endTrace(won,reason){
  const s=GS.ip;if(s.done)return;s.done=true;
  clearInterval(s.ti); // hopInt removed — only the countdown timer to clear
  stopMapPulse();if(TRACER.animId){cancelAnimationFrame(TRACER.animId);TRACER.animId=null;}
  try{SFX.bgStop();}catch(ex){}
  document.getElementById('ipTrace').style.display='none';
  document.getElementById('ipResult').style.display='';
  if(won){
    try{SFX.win();}catch(ex){}/*vox*/addXP(50);GS.ipWon=true;
    document.getElementById('ipResultInner').innerHTML=`<div class="iprwin">✓ HACKER LOCKED OUT!</div><div class="iprsub">Every IP confirmed. Machine isolated!<br>Outstanding work, Agent! 🏆</div>`;
    const e=pick(IP_TRACE_CHAT.onWin);gcMsg(e.persona,pick(e.msgs),600);
  } else {
    try{SFX.lose();}catch(ex){}/*vox*/
    document.getElementById('ipResultInner').innerHTML=`<div class="iprlose">✗ TRACE FAILED</div><div class="iprsub">${esc(reason||'The hacker escaped.')}<br>Keep practising!</div>`;
    const e=pick(IP_TRACE_CHAT.onLose);gcMsg(e.persona,pick(e.msgs),600);
  }
}

// ── RETRY MODAL — one second chance per trace ──────────────────
function showIPRetryModal(reason){
  document.getElementById('ipRetryReason').textContent=reason;
  document.getElementById('ipRetryModal').style.display='flex';
}

function retryIPTrace(){
  document.getElementById('ipRetryModal').classList.remove('open');
  const s=GS.ip;
  s.usedRetry=true; s.done=false;
  // Restart with same hop count but fresh hops and 45 seconds
  const hopCount=s.hops.length;
  const newHops=genHops(hopCount);
  s.hops=newHops; s.cur=-1;
  s.timer=45; s.waitingForAnswer=false;
  document.getElementById('ipTimer').textContent='45';
  document.getElementById('ipTimer').classList.remove('danger');
  document.getElementById('ipTrace').style.display='';
  document.getElementById('ipResult').style.display='none';
  try{SFX.bgStart();}catch(ex){}
  startIPCountdown();
  gcMsg('zara','Second chance! 45 seconds — stay focused! ⚡',200);
  gcMsg('marcus','You\'ve got this! Read those IPs carefully! 💪',800);
  setTimeout(()=>advanceHop(),2000);
}

function declineRetryIPTrace(){
  document.getElementById('ipRetryModal').style.display='none';
  const s=GS.ip;
  s.usedRetry=true;
  endTrace(false,'Trace abandoned.');
}

function closeIPTrace(){
  /*vox*/stopMapPulse();if(TRACER.animId){cancelAnimationFrame(TRACER.animId);TRACER.animId=null;}
  try{SFX.bgStop();}catch(ex){}
  document.getElementById('ipOverlay').classList.remove('open');
  document.body.classList.remove('alert-mode');
  GS.active=false;setSim('READY');setStep(0);clearGlows();
  document.getElementById('btnRefresh').classList.add('pulse-glow');
  schedAutoAdvance(12000);
}

function genHops(n){
  return shuffle([...CITIES]).slice(0,n).map((c,i,arr)=>({
    ...c,
    ip:`${randInt(2,220)}.${randInt(0,254)}.${randInt(0,254)}.${randInt(1,254)}`,
    hard: i >= arr.length - 2  // last 2 hops: similar decoy IPs
  }));
}

// Build 3 IP options for a hop — last hops use near-identical decoys
function buildHopOptions(hop){
  if(hop.hard){
    const p = hop.ip.split('.');
    const base = parseInt(p[3]);
    const decoy1 = p.slice(0,3).join('.')+'.'+((base+1)%256);
    const decoy2 = p.slice(0,3).join('.')+'.'+((base+2)%256);
    return shuffle([hop.ip, decoy1, decoy2]);
  }
  return shuffle([hop.ip, rndIP(), rndIP()]);
}

// ── CHAT ──────────────────────────────────────────────────────
function gcMsg(pId,msg,delay=0){
  const p=PERSONAS[pId];if(!p||!msg)return;
  setTimeout(()=>{
    const now=new Date(),t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    const w=document.createElement('div');w.className='cmsg p'+pId;
    w.innerHTML=`<div class="chdr"><span class="cname">${p.name}</span><span class="ctime">${t}</span></div><div class="cbub">${esc(msg)}</div>`;
    const box=document.getElementById('chatMsgs');box.appendChild(w);box.scrollTop=box.scrollHeight;
    try{SFX.chatPing();}catch(e){}
    /*vox*/
  },delay);
}

// ── 2-PART MODULE LOAD CHAT (slow — one message, then one 4s later) ──
function gcModLoad(modId){
  const chat=MODULE_GROUP_CHAT[modId];if(!chat)return;
  // Message 1: heads up (immediate)
  const e1=pick(chat.onLoad_1||[]);if(e1)gcMsg(e1.persona,pick(e1.msgs),500);
  // Message 2: where to start (4 seconds later)
  const e2=pick(chat.onLoad_2||[]);if(e2)gcMsg(e2.persona,pick(e2.msgs),5000);
}

// ── gcMod: module-specific first, falls back to GLOBAL_CHAT pool ──
function gcMod(modId,key,delay=400){
  const chat=MODULE_GROUP_CHAT[modId];
  // Try module-specific key first
  if(chat&&chat[key]){
    const e=pick(chat[key]);
    if(e)gcMsg(e.persona,pick(e.msgs),delay);
    return;
  }
  // Fall back to global pool
  const pool=GLOBAL_CHAT[key];
  if(!pool)return;
  const e=pick(pool);
  if(e)gcMsg(e.persona,pick(e.msgs),delay);
}

// ── SC BRIDGE REMOVED — stubs in setStep section ───────────────

// ── PLENARY MODAL ─────────────────────────────────────────────
function showPlenary(savedId,savedScenario){
  const mod=MODULES[savedId];if(!mod||!mod.plenary)return schedAutoAdvance(20000);
  const pl=mod.plenary;
  const allClear=savedScenario&&savedScenario.every(s=>s.ragAnswer==='G');
  const narrators=['Marcus:','Priya:','Zara:','The team:'];

  document.getElementById('plenTitle').textContent='🔍 DEBRIEF — '+mod.name;
  // Reset phase state
  document.getElementById('plenPhase1').style.display='block';
  document.getElementById('plenPhase2').style.display='none';
  document.getElementById('plenToQuiz').style.display='none';
  document.getElementById('plenContinue').style.display='none';

  // ── Phase 1: debrief content ──────────────────────────────
  let html=`<div style="font-size:12px;color:rgba(0,255,65,.4);margin-bottom:12px;">${pick(narrators)}</div>`;
  if(pl.analogy){html+=`<div class="plen-analogy">${pl.analogy}</div>`;}
  if(pl.whatHappened){html+=`<div class="plen-fact"><span class="plen-icon">⚡</span><span>${pl.whatHappened}</span></div>`;}
  if(pl.keyMove){html+=`<div class="plen-fact"><span class="plen-icon">🎯</span><span>${pl.keyMove}</span></div>`;}
  if(pl.realWorld){html+=`<div class="plen-fact"><span class="plen-icon">🏠</span><span>${pl.realWorld}</span></div>`;}
  document.getElementById('plenContent').innerHTML=html;

  // ── Report question (suppressed if all-clear) ─────────────
  if(allClear){
    GS.plenReportDone=true;
    document.getElementById('plenReport').innerHTML=
      `<div class="plen-allclear">✅ All clear — no threats found, no report needed!</div>`;
    document.getElementById('plenToQuiz').style.display='block';
  } else {
    const teams=shuffle([mod.reportTeams.correct,mod.reportTeams.incorrect]);
    const hint=mod.reportHint||'Think about what type of attack this was.';
    let rHtml=`<div class="plen-report-q">
      <div class="pq-q">📋 Who gets this report?</div>
      <div class="pq-hint">${esc(hint)}</div>
      <div class="pq-opts">`;
    teams.forEach(t=>{
      rHtml+=`<button class="pq-opt pq-report-opt" data-team="${escA(t)}" onclick="plenReport('${escA(t)}','${escA(mod.reportTeams.correct)}','${escA(savedId)}')">${esc(t)}</button>`;
    });
    rHtml+=`</div><div class="pq-result" id="pqr_report"></div></div>`;
    document.getElementById('plenReport').innerHTML=rHtml;
  }

  // ── Phase 2: quiz (built now, hidden until phase 2 shown) ─
  const quizPool=(()=>{
    if(!pl.quiz||!pl.quiz.length) return [];
    if(!SESSION_HISTORY.quizShown[savedId]) SESSION_HISTORY.quizShown[savedId]=new Set();
    const seen=SESSION_HISTORY.quizShown[savedId];
    const allIdx=pl.quiz.map((_,i)=>i);
    const unseen=allIdx.filter(i=>!seen.has(i));
    const pool=unseen.length>=2?unseen:allIdx; // reset if all questions seen
    const picked=shuffle(pool).slice(0,2);
    picked.forEach(i=>seen.add(i));
    return picked.map(i=>pl.quiz[i]);
  })();
  if(quizPool.length){
    GS.plenQuizTotal=quizPool.length;
    let qHtml='';
    quizPool.forEach((q,qi)=>{
      qHtml+=`<div class="pq" id="pq${qi}"><div class="pq-q">${q.q}</div><div class="pq-opts">`;
      q.options.forEach((opt,oi)=>{
        qHtml+=`<button class="pq-opt" id="pqo${qi}_${oi}" onclick="plenAnswer(${qi},${oi},${q.correct})">${esc(opt)}</button>`;
      });
      qHtml+=`</div><div class="pq-result" id="pqr${qi}"></div></div>`;
    });
    document.getElementById('plenQuiz').innerHTML=qHtml;
  } else {
    GS.plenQuizTotal=0;
  }

  document.getElementById('plenaryModal').classList.add('open');
}

// Transition from phase 1 (debrief) to phase 2 (quiz)
function plenPhase2(){
  document.getElementById('plenPhase1').style.display='none';
  document.getElementById('plenPhase2').style.display='block';
  document.querySelector('.plen-box').scrollTop=0;
  if(GS.plenQuizTotal===0) document.getElementById('plenContinue').style.display='block';
}


// Report question answered in plenary — unlocks the quiz
function plenReport(chosen,correct,savedId){
  document.querySelectorAll('.pq-report-opt').forEach(b=>{
    b.disabled=true;
    if(b.dataset.team===chosen)b.classList.add(chosen===correct?'correct':'wrong');
    if(b.dataset.team===correct&&chosen!==correct)b.classList.add('correct');
  });
  const ok=(chosen===correct);
  const r=document.getElementById('pqr_report');
  r.textContent=ok?'✓ Correct!':'Correct team is shown above.';
  r.className='pq-result '+(ok?'ok':'bad');
  doReport(ok,correct,savedId);
  toast(ok?'✓ Right team!':'✗ Wrong team',ok?'ok':'bad');
  // Write report result into results tab slot
  const slot=document.getElementById('reportResultSlot');
  if(slot)slot.innerHTML=`<div class="rc ${ok?'ok':'bad'}" style="margin-top:8px;"><h3>${ok?'✓':'✗'} Report ${ok?'to right team':'wrong team'}</h3><p>Correct: <strong>${esc(correct)}</strong></p></div>`;
  GS.plenReportDone=true;
  document.getElementById('plenToQuiz').style.display='block';
}

function plenAnswer(qi,oi,correct){
  const opts=document.querySelectorAll(`#pq${qi} .pq-opt`);
  opts.forEach(b=>b.disabled=true);
  const r=document.getElementById('pqr'+qi);
  GS.quizTotal=(GS.quizTotal||0)+1;
  if(oi===correct){
    opts[oi].classList.add('correct');
    r.textContent='✓ Correct! +15 XP';r.className='pq-result ok';
    try{SFX.correct();}catch(e){}
    addXP(15);
    GS.quizCorrect=(GS.quizCorrect||0)+1;
  } else {
    opts[oi].classList.add('wrong');opts[correct].classList.add('correct');
    r.textContent='Answer shown above in green.';r.className='pq-result bad';
    try{SFX.wrong();}catch(e){}
  }
  GS.plenQuizAnswered=(GS.plenQuizAnswered||0)+1;
  checkPlenComplete();
}

function checkPlenComplete(){
  if(GS.plenQuizAnswered>=(GS.plenQuizTotal||0)){
    setTimeout(()=>{document.getElementById('plenContinue').style.display='block';},600);
  }
}

function closePlenary(){
  const savedId=GS.debriefModId;
  document.getElementById('plenaryModal').classList.remove('open');
  if(savedId){gcMod(savedId,'scenarioComplete',300);}
  document.getElementById('btnRefresh').classList.add('pulse-glow');
  GS.debriefModId=null;
  if(GS.round>=GS.totalRounds&&!GS.queue.length){setTimeout(showEndgame,2000);}
  else{schedAutoAdvance(18000);}
}

// ── ENDGAME — delegates to gamification.js ──────────────────────
function showEndgame(){
  showEndSplash();
}

function resetAll(){
  /*vox*/clearTimeout(GS.autoTimer);clearTimeout(GS.stuckTimer);
  document.getElementById('endOverlay').classList.remove('open');
  document.getElementById('endSplash').classList.remove('open');
  document.getElementById('ipOverlay').classList.remove('open');
  document.getElementById('plenaryModal').classList.remove('open');
  document.body.classList.remove('alert-mode');
  Object.assign(GS,{hearts:GS.maxH,xp:0,round:0,modId:null,scenario:null,correctTool:null,toolOk:false,reportReady:false,active:false,phishDone:false,ipDone:false,queue:[],forceMod:null,badTools:0,sessId:uid(),scenarioRagDone:true,ip:{},gfr:null,autoTimer:null,stuckTimer:null,stuckStep:0,pendingEmail:null,debriefModId:null,plenReportDone:false,plenQuizAnswered:0,plenQuizTotal:0,quizCorrect:0,quizTotal:0,phishReported:false,ipWon:false,livesLost:0,selectedEmailId:null,emailOpened:false,sessionFlags:{allGreenUsed:false,highEscalationUsed:false,lastWasLow:false}});
  rHearts();rXP();rRound();
  document.getElementById('ilist').innerHTML=`<div id="ilistEmpty" style="padding:16px;font-size:15px;color:rgba(0,255,65,.35);text-align:center;line-height:2.4;">No emails yet!<br><span style="color:var(--g);font-size:14px;">👆 Click the green button<br>above to start!</span></div>`;
  document.getElementById('welcomeMsg').style.display='block';document.getElementById('emailView').style.display='none';
  document.getElementById('resultsView').innerHTML='Results appear here after each mission.';
  document.getElementById('chatMsgs').innerHTML='';
  resetTool();clearGlows();
  document.getElementById('toolSel').innerHTML='<option value="">— Choose your investigation tool —</option>';
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
