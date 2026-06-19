/* ════════════════════════════════════════════════════════════
   CYBERSHIELD ACADEMY
   FILE: modules_2026-06-10_v11.js
   ROLE: modules.js
   ════════════════════════════════════════════════════════════ */
// ============================================================
// MODULES.JS — CyberShield Academy Simulation Modules
// ============================================================

var MODULES = {};

// ── Utility: seeded random helpers ──────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dp=1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function jitter(base, pct=0.15) { return Math.round(base * (1 + (Math.random()-0.5)*pct*2)); }

// ── SCENARIO UTILITY ─────────────────────────────────────────
function buildRagProfile(type,count){
  if(!count)return[];
  const base={'RED_RED':['R','R','R','R'],'RED_AMBER':['R','A','A','A'],'AMBER_AMBER':['A','A','A','A'],'RED_RED_AMBER':['R','R','A','A'],'RED_AMBER_AMBER':['R','A','A','A'],'RED_RED_RED':['R','R','R','R']}[type]||['R','A'];
  const out=[];for(let i=0;i<count;i++)out.push(base[Math.min(i,base.length-1)]);
  return out;
}

// ─────────────────────────────────────────────────────────────
// MODULE 1: DDoS ATTACK
// ─────────────────────────────────────────────────────────────
MODULES.ddos = {
  id: 'ddos',
  name: 'DDoS ATTACK',
  emailSender: () => pick(['monitor@syswatch.net','alerts@networkops.io','noc@infrasec.com']),
  emailSubject: () => pick(['Unusual Traffic Alert','Network Load Notice','Traffic Spike Detected','Please Review: Traffic Anomaly']),
  emailBody(scenario) {
    const bodies = [
      `Hi,\n\nOur network is getting a LOT of visitors right now — way more than normal. It might be an attack, or it might just be a busy day.\n\nCan you check the traffic and let us know what's happening?\n\nThanks,\nSysWatch`,
      `Hi Agent,\n\nTraffic alert! Some of our services are getting hammered with requests. Please load the Network Traffic Monitor and check if it looks like an attack.\n\nNetwork Ops`,
      `Hello,\n\nWe've had reports that the website is running really slowly. The traffic numbers look odd. Can you investigate using the Network Traffic Monitor?\n\nCheers`
    ];
    return pick(bodies);
  },
  tools: {
    correct: 'Network Traffic Monitor',
    decoys: ['Password Audit Tool','Email Header Analyser','DNS Lookup Tool','System Log Viewer','Firewall Rules Editor']
  },
    generateScenario(params={}) {
    const {numEscalations=pick([1,2,2,2,3]),escalationType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']),includeEdgeCase=Math.random()>.3,numItems=6}=params;
    const pool=[
      {name:'Homepage',     purpose:'Main website people visit first'},
      {name:'Login Page',   purpose:'Where people sign in'},
      {name:'Image Loader', purpose:'Loads pictures and videos'},
      {name:'Search Bar',   purpose:'Lets people search the site'},
      {name:'Shop Checkout',purpose:'Where people pay for things'},
      {name:'Admin Area',   purpose:'Staff-only management area'},
      {name:'Video Stream', purpose:'Plays videos on the website'},
      {name:'API Gateway',  purpose:'Connects apps to the website'},
      {name:'CDN Server',   purpose:'Delivers images and files fast'},
    ];
    const chosen=shuffle(pool).slice(0,numItems);
    const rag=buildRagProfile(escalationType,numEscalations);
    const edgeAt=includeEdgeCase?numEscalations:-1;
    return chosen.map((svc,i)=>{
      const base=randInt(150,600);
      if(rag[i]==='R'){const m=randInt(11,35);const cur=base*m;return {name:svc.name,purpose:svc.purpose,avgHitsMin:base,currentHitsMin:Math.round(cur),ragAnswer:'R',actionAnswer:'block',notes:`${m}× higher than normal.`,handled:false,userRag:null,userAction:null,graphData:this._generateGraphHistory(base,Math.round(cur))};}
      else if(rag[i]==='A'){const m=randFloat(3.2,9.5,1);const cur=Math.round(base*m);return {name:svc.name,purpose:svc.purpose,avgHitsMin:base,currentHitsMin:cur,ragAnswer:'A',actionAnswer:'throttle',notes:`${m}× the usual amount.`,handled:false,userRag:null,userAction:null,graphData:this._generateGraphHistory(base,cur)};}
      else if(i===edgeAt){const m=randFloat(1.8,2.4,1);const cur=Math.round(base*m);return {name:svc.name,purpose:svc.purpose,avgHitsMin:base,currentHitsMin:cur,ragAnswer:'G',actionAnswer:'ignore',notes:`${m}× usual — today's product launch is bringing real visitors.`,handled:false,userRag:null,userAction:null,graphData:this._generateGraphHistory(base,cur)};}
      else{const cur=jitter(base,0.1);return {name:svc.name,purpose:svc.purpose,avgHitsMin:base,currentHitsMin:Math.round(cur),ragAnswer:'G',actionAnswer:'ignore',notes:`${Math.round(cur).toLocaleString()}/min — close to the ${base.toLocaleString()}/min average.`,handled:false,userRag:null,userAction:null,graphData:this._generateGraphHistory(base,Math.round(cur))};}
    });
  },
  _generateGraphHistory(baseline, current) {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const spike = t > 0.6 ? baseline + (current - baseline) * Math.pow((t - 0.6) / 0.4, 2) : baseline;
      pts.push(Math.round(jitter(spike, 0.08)));
    }
    return pts;
  },
  reportTeams: {
    correct: 'Network Operations Centre (NOC)',
    incorrect: 'Human Resources Department'
  },
  completionText(mode, scenario) {
    const attacked = scenario.filter(s => s.ragAnswer !== 'G').length;
    if (attacked === 0) {
      return `<div class="rc ok"><h3>✓ All clear — everything looked normal!</h3><p>Good job checking everything carefully even when there's nothing wrong. Real cyber detectives always check, even when it's all fine!</p></div>`;
    }
    const top = scenario.find(s => s.ragAnswer === 'R') || scenario.find(s => s.ragAnswer === 'A');
    const ratio = top ? Math.round(top.currentHitsMin / top.avgHitsMin) : '??';
    return `<div class="rc info"><h3>DDoS ATTACK — KEY FACTS</h3>
    <p>The traffic was ${ratio}x higher than normal — like ${ratio * 100} people trying to get through one door at once!</p>
    <p style="margin-top:8px;">Over 10x normal = BLOCK (Red). 3–10x = THROTTLE (Amber). Normal = IGNORE (Green).</p></div>`;
  },
  plenary: {
    reportHint: 'This was a network traffic attack — which team looks after the network?',
    analogy:      '🍕 Like 1,000 pizzas arriving at once that nobody ordered — the street gets blocked and real people can\'t get in.',
    whatHappened: 'Hackers sent thousands of fake visitors to flood our website until it broke.',
    keyMove:      'Over 10× normal = Block. Between 3–10× = Slow it down. Normal = Leave it alone.',
    realWorld:    'Ever tried to load a game or website and it just... wouldn\'t load? Sometimes that\'s a DDoS!',
    quiz: [
      { q: 'What does a DDoS attack do?', options: ['Steals your password 🔑', 'Floods a website until it breaks 🌊', 'Deletes your files 🗑️'], correct: 1 },
      { q: 'Traffic is 15× higher than normal. What do you do?', options: ['Leave it — probably fine ✅', 'Block it 🚫', 'Restart the computer 💻'], correct: 1 },
      { q: 'What is a botnet?', options: ['A type of antivirus 🛡️', 'A robot that cleans computers 🤖', 'Thousands of hacked computers used to attack at once 💻'], correct: 2 },
      { q: 'Traffic is 2× normal on a day with a big product launch. What should you do?', options: ['Block it straight away 🚫', 'Investigate — it might be real traffic 🔍', 'Ignore it completely ✅'], correct: 1 },
      { q: 'What does DDoS stand for?', options: ['Distributed Denial of Service', 'Digital Data on Servers', 'Direct Download of Software'], correct: 0 },
      { q: 'Why do attackers use thousands of computers in a DDoS?', options: ["To make the attack look more legitimate 🎭","So it's harder to block — you can't just ban one IP 🌐","To save money on internet bills 💰"], correct: 1 },
      { q: 'What does "throttling" traffic mean?', options: ["Blocking it completely 🚫","Slowing it down so the server can cope ⚡","Speeding it up 🏎️"], correct: 1 },
      { q: 'Why are DDoS attacks hard to stop?', options: ["Because the traffic looks real and comes from everywhere 🌍","Because they happen at night 🌙","Because computers are slow 🐢"], correct: 0 },
      { q: 'What should you protect MOST during a DDoS?', options: ["The coffee machine ☕","Critical services like login pages and payments 💳","The office printer 🖨️"], correct: 1 },
    ]
  },
};

// ─────────────────────────────────────────────────────────────
// MODULE 2: MALWARE INFECTION
// ─────────────────────────────────────────────────────────────
MODULES.malware = {
  id: 'malware',
  name: 'MALWARE INFECTION',
  emailSender: () => pick(['endpoint@secops.net','av-alerts@defender.io','siem@threatwatch.com']),
  emailSubject: () => pick(['Endpoint Alert: Suspicious Process','AV Detection Report','Unusual Process Activity Flagged','Security Alert - Action Required']),
  emailBody(scenario) {
    return pick([
      `Hi,\n\nSome programs running on our computers are looking a bit weird. Can you check them out using the Process Monitor?\n\nSome might be fine, some might be bad software hiding on our system.\n\nThanks,\nSecurity Team`,
      `Hello Agent,\n\nWe've spotted some unusual programs running. Some have strange names. Some are using loads of CPU (computer power).\n\nPlease check each one using the Process Monitor.\n\nCheers,\nDefender Team`,
      `Hi,\n\nAlert! Something odd might be running on our computers. Load the Process Monitor and check if any programs look suspicious.\n\nRemember: if the name looks weird or the CPU is really high — that's a red flag!\n\nSecurity Ops`
    ]);
  },
  tools: {
    correct: 'Process Monitor',
    decoys: ['Network Traffic Monitor','Email Header Analyser','Bandwidth Checker','Firewall Rules Editor','Packet Sniffer']
  },
    generateScenario(params={}) {
    const {numEscalations=pick([1,2,2,2,3]),escalationType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']),includeEdgeCase=Math.random()>.3,numItems=6}=params;
    const malNames=['cryptminer.tmp','svch0st.exe','xyzwin32.exe','backdoor_srv.exe','helper32.exe','update_helper.tmp'];
    const legit=[{name:'svchost.exe',cpuBase:1.2,memBase:48,purpose:'Windows system service'},{name:'chrome.exe',cpuBase:8,memBase:340,purpose:'Google Chrome browser'},{name:'explorer.exe',cpuBase:0.8,memBase:62,purpose:'Windows file explorer'},{name:'msedge.exe',cpuBase:6,memBase:280,purpose:'Microsoft Edge browser'},{name:'antimalware.exe',cpuBase:2.1,memBase:95,purpose:'Windows Defender'},{name:'winlogon.exe',cpuBase:0.4,memBase:18,purpose:'Windows login manager'},{name:'taskhost.exe',cpuBase:0.6,memBase:35,purpose:'Windows task host'}];
    const rp=buildRagProfile(escalationType,numEscalations);
    const edgeAt=includeEdgeCase?numEscalations:-1;
    const items=[];
    for(let i=0;i<numItems;i++){
      if(rp[i]==='R'){const nm=pick(malNames);const cpu=randFloat(40,95,1);items.push({name:nm,purpose:'Not a known Windows program',cpu,memMB:randInt(400,1400),networkKBs:randInt(500,5000),ragAnswer:'R',actionAnswer:'quarantine',notes:'Not recognised in the standard program list.',handled:false,userRag:null,userAction:null});}
      else if(rp[i]==='A'){const p=pick(legit);const cpu=randFloat(72,90,1);items.push({name:p.name,purpose:p.purpose,cpu,memMB:Math.round(jitter(p.memBase,0.15)),networkKBs:randInt(80,300),ragAnswer:'A',actionAnswer:'investigate',notes:`Real program but CPU is quite high right now (${cpu.toFixed(1)}%).`,handled:false,userRag:null,userAction:null});}
      else if(i===edgeAt){const cpu=randFloat(48,66,1);items.push({name:'WinUpdate.exe',purpose:'Windows Update',cpu,memMB:randInt(400,700),networkKBs:randInt(10,80),ragAnswer:'G',actionAnswer:'ignore',notes:'Windows Update.',handled:false,userRag:null,userAction:null});}
      else{const p=pick(legit);items.push({name:p.name,purpose:p.purpose,cpu:parseFloat(jitter(p.cpuBase,0.2).toFixed(1)),memMB:Math.round(jitter(p.memBase,0.12)),networkKBs:randInt(0,50),ragAnswer:'G',actionAnswer:'ignore',notes:'Known Windows program.',handled:false,userRag:null,userAction:null});}
    }
    return items;
  },
  reportTeams: { correct: 'Incident Response Team', incorrect: 'Facilities Management' },
  completionText(mode, scenario) {
    return `<div class="rc info"><h3>MALWARE — KEY FACTS</h3>
    <p>Malware is bad software that hides on your computer. The key clues: <strong>weird names</strong> (especially ones that look ALMOST like real names), <strong>high CPU</strong>, and <strong>high network usage</strong> (secretly sending data).</p>
    <p style="margin-top:8px;">Remember: high CPU doesn't always mean malware (Windows Update is legit!). Check the NAME first.</p></div>`;
  },
  plenary: {
    reportHint: 'Malware is a security incident — which team responds to those?',
    analogy:      '🕵️ Like a spy wearing a school uniform — they look like they belong, but they\'re secretly stealing things.',
    whatHappened: 'Bad software had sneaked onto a computer, hiding inside programs with suspicious or fake names.',
    keyMove:      'Unknown name = Quarantine. Real name but very high CPU = Investigate. Known and normal = Leave it.',
    realWorld:    'If your computer suddenly gets really slow for no reason, it might have something hiding on it — tell a grown-up!',
    quiz: [
      { q: 'You see "cryptminer.tmp" using 92% CPU. What is it probably doing?', options: ['Running normally ✅', 'Hiding as malware and using your computer\'s power 🔴', 'Just updating Windows 🔄'], correct: 1 },
      { q: '"WinUpdate.exe" is using 55% CPU. What do you do?', options: ['Quarantine it immediately 🚫', 'Leave it — Windows Update often uses lots of power ✅', 'Turn off the computer 💻'], correct: 1 },
      { q: 'What is malware?', options: ['A type of computer hardware 🖥️', 'Bad software designed to cause harm 🦠', 'A fast internet connection 📶'], correct: 1 },
      { q: 'You "quarantine" a program. What does that mean?', options: ['You delete it permanently 🗑️', 'You move it somewhere safe so it can\'t spread 🔒', 'You give it more memory 💾'], correct: 1 },
      { q: 'Malware sometimes uses low CPU on purpose. Why?', options: ['To make your computer faster ⚡', 'To hide and avoid being spotted 🕵️', 'Because it\'s not doing anything 😴'], correct: 1 },
      { q: 'What should you do FIRST if you spot malware?', options: ['Delete the whole computer 🗑️', 'Isolate the computer from the network immediately 🔌', 'Tell your friends 📱'], correct: 1 },
      { q: 'Malware with a name like "svchost.exe" is trying to:', options: ["Help Windows run faster ⚡","Look like a real Windows program to hide 🎭","Update your antivirus 🛡️"], correct: 1 },
      { q: 'High network usage on an unknown process might mean:', options: ["The internet is slow today 🐌","The program is secretly sending data to a hacker 📤","The video call is buffering 📹"], correct: 1 },
      { q: 'What is a "trojan horse" type of malware?', options: ["A virus from Greece 🏛️","Software that looks helpful but is secretly harmful 🎁","A type of firewall 🛡️"], correct: 1 },
    ]
  },
};

// ─────────────────────────────────────────────────────────────
// MODULE 3: SQL INJECTION
// ─────────────────────────────────────────────────────────────
MODULES.sqli = {
  id: 'sqli',
  name: 'SQL INJECTION',
  emailSender: () => pick(['waf@websec.net','dbmonitor@dataops.io','appsec@platform.com']),
  emailSubject: () => pick(['WAF Alert: Suspicious Query Strings','Database Anomaly Detected','Potential SQL Injection Attempt','App Security Review Needed']),
  emailBody() {
    return pick([
      `Hi,\n\nOur Web Application Firewall has logged some suspicious query strings hitting our database endpoints. Could you check the Database Query Analyser and see what's going on?\n\nThanks,\nWebSec Team`,
      `Hello,\n\nWe're seeing some odd patterns in our database request logs. Some could be SQL injection probes. Please investigate and rate each one.\n\nRegards,\nDataOps`,
      `Hi Agent,\n\nSeveral queries have been flagged by automated monitoring. Please review using the Database Query Analyser and take appropriate action.\n\nApp Security`
    ]);
  },
  tools: {
    correct: 'Database Query Analyser',
    decoys: ['Network Traffic Monitor','Process Monitor','Email Header Analyser','Password Audit Tool','VPN Log Viewer']
  },
  generateScenario() {
    const endpoints = [
      '/api/users/search',
      '/api/login',
      '/api/products/filter',
      '/admin/reports',
      '/api/orders/lookup',
      '/api/newsletter/subscribe',
    ];

    const maliciousPayloads = [
      `' OR '1'='1`,
      `'; DROP TABLE users; --`,
      `1 UNION SELECT username,password FROM admin --`,
      `' OR 1=1 --`,
      `admin'--`,
      `'; EXEC xp_cmdshell('whoami'); --`,
      `1; SELECT * FROM information_schema.tables --`
    ];
    const benignPayloads = [
      `search=laptop+stand`,
      `user_id=4821`,
      `filter=price_asc&category=electronics`,
      `email=user%40example.com`,
      `order_id=ORD-00492`,
      `q=blue+widgets`
    ];

    const chosen = shuffle(endpoints).slice(0, 5);
    const numMalicious = randInt(1, 3);

    return chosen.map((ep, i) => {
      const isMalicious = i < numMalicious;
      const payload = isMalicious ? pick(maliciousPayloads) : pick(benignPayloads);
      const requestsPerMin = isMalicious ? randInt(40, 300) : randInt(2, 25);
      const sourceIPs = isMalicious ? randInt(1, 5) : randInt(10, 200);
      const statusCodes = isMalicious ? pick(['200 (Success!)', '500 (Error)', '403 (Blocked)']) : '200 (OK)';

      let ragAnswer, actionAnswer;
      if (isMalicious && payload.includes('DROP') || payload.includes('EXEC')) {
        ragAnswer = 'R'; actionAnswer = 'block';
      } else if (isMalicious) {
        ragAnswer = Math.random() > 0.4 ? 'R' : 'A';
        actionAnswer = ragAnswer === 'R' ? 'block' : 'investigate';
      } else {
        ragAnswer = 'G'; actionAnswer = 'ignore';
      }

      return {
        name: ep,
        purpose: `${ep.includes('login') ? 'User login' : ep.includes('admin') ? 'Admin panel' : 'API'} endpoint`,
        payload,
        requestsPerMin,
        sourceIPs,
        statusCodes,
        ragAnswer, actionAnswer,
        notes: isMalicious ? 'Contains SQL metacharacters — possible injection attempt.' : 'Looks like normal user activity.',
        handled: false, userRag: null, userAction: null
      };
    });
  },
  reportTeams: { correct: 'Application Security Team', incorrect: 'Marketing Department' },
  completionText(mode, scenario) {
    return `<div class="result-card"><h3>WHAT IS SQL INJECTION?</h3>
    <p>Imagine a lock that opens when you say your name. SQL injection is like saying "My name is Bob OR the door is always unlocked" — tricking the lock into opening for anyone.</p>
    <p style="margin-top:8px;">Attackers type special characters like <code style="color:#00f5ff">' OR '1'='1</code> into login forms or search boxes to trick databases into giving away all their secrets. It's one of the oldest — and most dangerous — web attacks!</p></div>`;
  }
};

// ─────────────────────────────────────────────────────────────
// MODULE 4: RANSOMWARE
// ─────────────────────────────────────────────────────────────
MODULES.ransomware = {
  id: 'ransomware',
  name: 'RANSOMWARE',
  emailSender: () => pick(['backup@dataprotect.net','fileserver@internal.corp','sysadmin@network.local']),
  emailSubject: () => pick(['File Encryption Alert','URGENT: Backup Integrity Check','File Server Anomaly Detected','Storage Alert - Unusual Activity']),
  emailBody() {
    return pick([
      `Hi,\n\nSomething scary is happening! Files on our computers are being locked and renamed with weird extensions like ".locked" or ".encrypted".\n\nStaff can't open their documents. Please use the File Integrity Monitor to find out which drives are affected!\n\nUrgent — SysAdmin`,
      `Hello Agent,\n\nFiles are being encrypted (scrambled and locked) on our file servers right now! Someone might be trying to hold our files for ransom.\n\nLoad the File Integrity Monitor quickly and check each drive!\n\nData Protection Team`,
      `Hi,\n\nFiles are disappearing or being renamed with strange extensions. Our backup system has flagged high write activity. This looks like ransomware — please check every drive immediately!\n\nBackup Systems`
    ]);
  },
  tools: {
    correct: 'File Integrity Monitor',
    decoys: ['Network Traffic Monitor','Database Query Analyser','Email Header Analyser','Process Monitor','Wi-Fi Scanner']
  },
    generateScenario(params={}) {
    const {numEscalations=pick([1,2,2,2,3]),escalationType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']),includeEdgeCase=Math.random()>.3,numItems=6}=params;
    const drives=[{name:'C:\\ System Drive',purpose:'Operating system and programs'},{name:'D:\\ Documents Drive',purpose:'Staff documents and files'},{name:'E:\\ Backup Share',purpose:'Nightly backup storage'},{name:'F:\\ Media Files',purpose:'Company photos and videos'},{name:'\\\\Server01\\HR',purpose:'HR files and records'},{name:'\\\\Server02\\Finance',purpose:'Finance spreadsheets'},{name:'\\\\NAS01\\Archive',purpose:'Long-term archive storage'},{name:'G:\\ Dev Share',purpose:'Developer code and projects'}];
    const chosen=shuffle(drives).slice(0,numItems);
    const rp=buildRagProfile(escalationType,numEscalations);
    const edgeAt=includeEdgeCase?numEscalations:-1;
    return chosen.map((d,i)=>{
      const total=randInt(1200,45000);
      if(rp[i]==='R'){const pct=randFloat(28,80)/100;const enc=Math.round(total*pct);const ext=pick(['.locked','.encrypted','.WNCRY','.cerber','.crypted']);return {name:d.name,purpose:d.purpose,totalFiles:total,encryptedFiles:enc,newExtensions:ext,writeOpsMin:randInt(2000,8000),ragAnswer:'R',actionAnswer:'isolate',notes:`${Math.round(pct*100)}% of files encrypted. Extension: "${ext}".`,handled:false,userRag:null,userAction:null};}
      else if(rp[i]==='A'){const enc=Math.round(total*randFloat(0.5,4)/100);const ext=pick(['.locked','.encrypted','.WNCRY','.zepto']);return {name:d.name,purpose:d.purpose,totalFiles:total,encryptedFiles:enc,newExtensions:ext,writeOpsMin:randInt(300,900),ragAnswer:'A',actionAnswer:'investigate',notes:`${enc.toLocaleString()} files now have a "${ext}" extension.`,handled:false,userRag:null,userAction:null};}
      else if(i===edgeAt){return {name:d.name,purpose:d.purpose,totalFiles:total,encryptedFiles:Math.round(total*randFloat(0.1,0.3)/100),newExtensions:'.bak',writeOpsMin:randInt(600,3500),ragAnswer:'G',actionAnswer:'ignore',notes:'Extension: .bak — this is just a backup file. Normal for a backup drive!',handled:false,userRag:null,userAction:null};}
      else{return {name:d.name,purpose:d.purpose,totalFiles:total,encryptedFiles:Math.round(total*randFloat(0.1,1)/100),newExtensions:'None',writeOpsMin:randInt(5,55),ragAnswer:'G',actionAnswer:'ignore',notes:'',handled:false,userRag:null,userAction:null};}
    });
  },
  reportTeams: { correct: 'Incident Response & Business Continuity Team', incorrect: 'Customer Service Team' },
  completionText(mode, scenario) {
    return `<div class="rc info"><h3>RANSOMWARE — KEY FACTS</h3>
    <p>Ransomware locks your files using a secret code. The clues: <strong>suspicious new file extensions</strong> (.locked, .encrypted), <strong>very high write operations</strong>, and <strong>lots of files affected</strong>. Watch out for the backup drive edge case — ".bak" on a backup drive is NORMAL!</p></div>`;
  },
  plenary: {
    reportHint: 'Ransomware is a major emergency — which team handles big security incidents and keeps the business running?',
    analogy:      '🔒 Like someone putting a padlock on your bedroom and saying "pay up if you want your stuff back!"',
    whatHappened: 'Ransomware scrambled files on our drives so nobody could open them, hoping we\'d pay money for the key.',
    keyMove:      'Suspicious extension + lots of files = Isolate the drive fast. Just a few files affected = Investigate. Normal backup activity (.bak) = Leave it.',
    realWorld:    'Ransomware has locked schools, hospitals, and businesses. Backing up your files means the hackers can\'t win!',
    quiz: [
      { q: 'Files on a drive now end in ".locked". What does that mean?', options: ['They\'ve been backed up safely 💾', 'They\'ve been encrypted by ransomware 🔴', 'The drive is full 📦'], correct: 1 },
      { q: 'The backup drive has lots of ".bak" files. What do you do?', options: ['Isolate it immediately! 🚫', 'Leave it — ".bak" is just a backup file ✅', 'Delete all the .bak files 🗑️'], correct: 1 },
      { q: 'What does encryption mean?', options: ['Making files bigger 📂', 'Scrambling data so it can\'t be read without a key 🔑', 'Copying files to another drive 💿'], correct: 1 },
      { q: 'Why is backing up your files important?', options: ['It makes your computer faster ⚡', 'If ransomware hits, you still have copies 💾', 'It stops all viruses from getting in 🛡️'], correct: 1 },
      { q: 'Should you pay a ransom to get your files back?', options: ['Yes — they always keep their word 💰', 'No — paying doesn\'t guarantee you get your files back 🚫', 'Only pay half of it 🤔'], correct: 1 },
      { q: 'How does ransomware usually arrive on a computer?', options: ['By typing in a special code 🔢', 'Via phishing emails or infected downloads 📧', 'Only through USB sticks 🔌'], correct: 1 },
      { q: 'What does "isolating" a drive mean?', options: ['Putting it in the freezer ❄️', 'Disconnecting it so the ransomware can\'t spread further 🔌', 'Making it run faster ⚡'], correct: 1 },
      { q: 'Why does ransomware change file extensions like ".locked"?', options: ['To organise your files better 📁', 'To signal the files have been encrypted and are now unusable 🔒', 'To save disk space 💾'], correct: 1 },
      { q: 'What is the best defence against ransomware?', options: ['Keep recent backups stored offline or offsite 💾', 'Have a very long password 🔑', 'Never use the internet 🌐'], correct: 0 },
    ]
  },
};

// ─────────────────────────────────────────────────────────────
// MODULE 5: PHISHING CREDENTIAL HARVEST
// ─────────────────────────────────────────────────────────────
MODULES.phishingHarvest = {
  id: 'phishingHarvest',
  name: 'CREDENTIAL HARVESTING',
  emailSender: () => pick(['siem@identwatch.net','auth@accessops.io','cloudwatch@sso.corp']),
  emailSubject: () => pick(['Auth Log Alert: Multiple Failed Logins','Suspicious Login Activity','Credential Stuffing Attempt Detected','Account Security Alert']),
  emailBody() {
    return pick([
      `Hi,\n\nWe've seen an unusual spike in failed authentication attempts across several accounts. This could indicate a credential stuffing or phishing harvest attack. Please review using the Authentication Log Viewer.\n\nIdentity Watch`,
      `Hello,\n\nMultiple accounts have been flagged for suspicious login patterns. Some may have been compromised. Load the Auth Log Viewer and assess each account's activity.\n\nAccess Ops`,
      `Hi Agent,\n\nOur SSO system detected thousands of login failures in a short window. Someone may be trying stolen credentials from a data breach. Investigate immediately.\n\nCloudWatch`
    ]);
  },
  tools: {
    correct: 'Authentication Log Viewer',
    decoys: ['Network Traffic Monitor','File Integrity Monitor','DNS Lookup Tool','Email Header Analyser','Bandwidth Checker']
  },
  generateScenario() {
    const accounts = [
      { name: 'j.smith@company.com', role: 'Sales Manager' },
      { name: 'admin@company.com', role: 'System Administrator' },
      { name: 'ceo@company.com', role: 'Chief Executive' },
      { name: 'h.patel@company.com', role: 'Finance Officer' },
      { name: 'service.account@company.com', role: 'Automated Service Account' },
      { name: 'l.chen@company.com', role: 'Developer' },
      { name: 'reception@company.com', role: 'Receptionist' },
    ];

    const chosen = shuffle(accounts).slice(0, 5);
    const attackedCount = randInt(1, 3);

    return chosen.map((acc, i) => {
      const isAttacked = i < attackedCount;
      const isCompromised = isAttacked && Math.random() > 0.5;

      const failedLogins = isAttacked ? randInt(150, 4000) : randInt(0, 8);
      const successfulLogins = isCompromised ? randInt(1, 5) : randInt(1, 15);
      const uniqueIPs = isAttacked ? randInt(50, 500) : randInt(1, 3);
      const geoLocations = isAttacked ? randInt(8, 40) : randInt(1, 2);
      const timeSpanMins = isAttacked ? randInt(2, 20) : randInt(60, 480);

      let ragAnswer, actionAnswer;
      if (isCompromised) {
        ragAnswer = 'R'; actionAnswer = 'lockAccount';
      } else if (isAttacked) {
        ragAnswer = 'A'; actionAnswer = 'forceReset';
      } else {
        ragAnswer = 'G'; actionAnswer = 'ignore';
      }

      return {
        name: acc.name,
        purpose: acc.role,
        failedLogins,
        successfulLogins,
        uniqueIPs,
        geoLocations,
        timeSpanMins,
        ragAnswer, actionAnswer,
        notes: isCompromised ? 'POSSIBLE BREACH: Success after mass failures = compromised.' : isAttacked ? 'Under attack but not yet breached.' : 'Normal login pattern.',
        handled: false, userRag: null, userAction: null
      };
    });
  },
  reportTeams: { correct: 'Identity & Access Management (IAM) Team', incorrect: 'Graphic Design Team' },
  completionText(mode, scenario) {
    return `<div class="result-card"><h3>WHAT IS CREDENTIAL HARVESTING?</h3>
    <p>Imagine someone finds a list of everyone's username and password from a data breach at another website. They then try all those passwords on YOUR website — this is called "credential stuffing". It's like someone finding your old house key and trying it on every door in town.</p>
    <p style="margin-top:8px;">The telltale signs are: hundreds of failed logins in minutes, from many different countries, on the same account. If they succeed even once, the account is compromised!</p></div>`;
  }
};

// ─────────────────────────────────────────────────────────────
// MODULE 6: MAN-IN-THE-MIDDLE (MitM)
// ─────────────────────────────────────────────────────────────
MODULES.mitm = {
  id: 'mitm',
  name: 'MAN-IN-THE-MIDDLE ATTACK',
  emailSender: () => pick(['ssl@certwatch.net','tls@securenet.io','monitor@sslops.com']),
  emailSubject: () => pick(['SSL Certificate Anomaly','TLS Intercept Warning','Unusual Certificate Detected','Network Intercept Alert']),
  emailBody() {
    return pick([
      `Hi,\n\nOur certificate monitoring service has picked up some anomalies with SSL/TLS traffic. It's possible someone is intercepting communications. Please review using the SSL Certificate Inspector.\n\nCertWatch`,
      `Hello,\n\nWe've detected what could be rogue SSL certificates on some network connections. This could indicate a man-in-the-middle attack. Load the SSL Certificate Inspector immediately.\n\nSecureNet`,
      `Hi Agent,\n\nNetwork probes suggest some connections may be being intercepted. Check the SSL Certificate Inspector and assess each connection.\n\nSSL Operations`
    ]);
  },
  tools: {
    correct: 'SSL Certificate Inspector',
    decoys: ['Process Monitor','Database Query Analyser','Bandwidth Checker','Email Header Analyser','Wi-Fi Scanner']
  },
  generateScenario() {
    const connections = [
      { name: 'Banking Portal (TLS)', purpose: 'Financial transaction HTTPS' },
      { name: 'Internal VPN Tunnel', purpose: 'Staff remote access' },
      { name: 'Email Server (SMTP/TLS)', purpose: 'Outbound encrypted email' },
      { name: 'Cloud Storage (HTTPS)', purpose: 'File sync to cloud provider' },
      { name: 'HR System (HTTPS)', purpose: 'Personnel data access' },
      { name: 'Public Website (HTTPS)', purpose: 'Customer-facing site' },
    ];

    const chosen = shuffle(connections).slice(0, 5);
    const interceptedCount = randInt(0, 2);

    return chosen.map((conn, i) => {
      const isIntercepted = i < interceptedCount;
      const certAuthority = isIntercepted
        ? pick(['UNKNOWN CA','Self-Signed','DigiCert (UNVERIFIED)','Let\'s Encrypt (MISMATCH)'])
        : pick(['DigiCert Inc','Comodo CA','Let\'s Encrypt (Valid)','GlobalSign']);
      const fingerprint = isIntercepted
        ? pick(['AA:BB:CC:DD:EE:FF (MISMATCH)','HASH_CHANGED_SINCE_YESTERDAY','00:00:00:00:00:00 (INVALID)'])
        : `${randInt(10,99).toString(16).toUpperCase()}:${randInt(10,99).toString(16).toUpperCase()}:${randInt(10,99).toString(16).toUpperCase()} (Valid)`;
      const daysToExpiry = isIntercepted ? randInt(-5, 2) : randInt(30, 365);
      const tlsVersion = isIntercepted ? pick(['TLS 1.0 (Deprecated!)','SSL 2.0 (INSECURE!)','TLS 1.1 (Outdated)']) : pick(['TLS 1.3','TLS 1.2']);
      const rehandshakes = isIntercepted ? randInt(80, 400) : randInt(0, 5);

      let ragAnswer, actionAnswer;
      if (isIntercepted && (daysToExpiry < 0 || rehandshakes > 100)) {
        ragAnswer = 'R'; actionAnswer = 'revokeBlock';
      } else if (isIntercepted) {
        ragAnswer = 'A'; actionAnswer = 'investigate';
      } else {
        ragAnswer = 'G'; actionAnswer = 'ignore';
      }

      return {
        name: conn.name,
        purpose: conn.purpose,
        certAuthority,
        fingerprint,
        daysToExpiry,
        tlsVersion,
        rehandshakes,
        ragAnswer, actionAnswer,
        notes: isIntercepted ? 'Certificate anomaly detected — possible interception.' : 'Certificate looks legitimate.',
        handled: false, userRag: null, userAction: null
      };
    });
  },
  reportTeams: { correct: 'Network Security & PKI Team', incorrect: 'Sales Team' },
  completionText(mode, scenario) {
    return `<div class="result-card"><h3>WHAT IS MAN-IN-THE-MIDDLE?</h3>
    <p>Imagine you pass a note to your friend, but someone in the middle secretly reads it, possibly changes it, and passes it on. That's exactly what a MitM attack does — it intercepts your internet traffic.</p>
    <p style="margin-top:8px;">SSL/TLS certificates are like digital ID cards that prove websites are who they say they are. If the certificate looks wrong — wrong authority, expired, or fingerprint changed — it might mean someone is secretly listening in.</p></div>`;
  }
};

// ─────────────────────────────────────────────────────────────
// MODULE 7: INSIDER THREAT / DATA EXFILTRATION
// ─────────────────────────────────────────────────────────────
MODULES.insiderThreat = {
  id: 'insiderThreat',
  name: 'DATA EXFILTRATION',
  emailSender: () => pick(['dlp@datawatch.net','audit@complianceops.io','ueba@behaviorwatch.com']),
  emailSubject: () => pick(['DLP Alert: Large Data Transfer','Unusual Data Access Pattern','Behavioural Anomaly Detected','UEBA Alert - Review Required']),
  emailBody() {
    return pick([
      `Hi,\n\nOur Data Loss Prevention system has flagged some unusual data transfers. It could be an insider threat or an external attacker who has gained internal access. Please review using the DLP Monitor.\n\nDataWatch`,
      `Hello,\n\nBehavioural analytics have picked up some anomalous activity. User access patterns don't match their normal baseline. Please investigate.\n\nCompliance Ops`,
      `Hi Agent,\n\nWe've noticed large, unusual data movements that could indicate data exfiltration. Please load the DLP Monitor and assess urgently.\n\nUEBA Team`
    ]);
  },
  tools: {
    correct: 'DLP Monitor',
    decoys: ['Network Traffic Monitor','Email Header Analyser','SSL Certificate Inspector','Process Monitor','Database Query Analyser']
  },
  generateScenario() {
    const users = [
      { name: 'j.wilson (Sales)', dept: 'Sales', normalGB: 0.8 },
      { name: 'a.kumar (IT Admin)', dept: 'IT', normalGB: 4.2 },
      { name: 'm.jones (Finance)', dept: 'Finance', normalGB: 0.5 },
      { name: 'r.taylor (HR)', dept: 'HR', normalGB: 0.3 },
      { name: 'b.murphy (Dev)', dept: 'Engineering', normalGB: 6.1 },
      { name: 'c.lee (Exec Asst)', dept: 'Executive', normalGB: 0.4 },
    ];

    const chosen = shuffle(users).slice(0, 5);
    const exfilCount = randInt(0, 2);

    return chosen.map((user, i) => {
      const isExfil = i < exfilCount;
      const dataTransferGB = isExfil
        ? parseFloat((user.normalGB * randFloat(8, 40)).toFixed(2))
        : parseFloat((user.normalGB * randFloat(0.8, 1.3)).toFixed(2));
      const destination = isExfil
        ? pick(['External USB Drive','Personal Gmail (via browser)','Unknown FTP Server 194.x.x.x','Mega.nz Upload','Dropbox Personal (non-corporate)'])
        : pick(['Internal Server Share','Corporate OneDrive','Company Email']);
      const fileTypes = isExfil
        ? pick(['.xlsx .docx .pdf (sensitive)','CUSTOMER_DATA.csv, CONTRACTS.zip','intellectual_property.zip'])
        : pick(['project_docs.docx','normal work files']);
      const timeOfDay = isExfil ? pick(['02:47 AM','11:58 PM','01:23 AM','Saturday 3:15 AM']) : pick(['09:30 AM','2:15 PM','11:00 AM']);
      const normalBaseline = user.normalGB;

      let ragAnswer, actionAnswer;
      if (isExfil && dataTransferGB > normalBaseline * 10) {
        ragAnswer = 'R'; actionAnswer = 'lockAccount';
      } else if (isExfil) {
        ragAnswer = 'A'; actionAnswer = 'investigate';
      } else {
        ragAnswer = 'G'; actionAnswer = 'ignore';
      }

      return {
        name: user.name,
        purpose: `${user.dept} Department`,
        dataTransferGB,
        normalBaselineGB: normalBaseline,
        destination,
        fileTypes,
        timeOfDay,
        ragAnswer, actionAnswer,
        notes: isExfil ? 'Data transfer far exceeds baseline — check destination!' : 'Transfer within normal range for this user.',
        handled: false, userRag: null, userAction: null
      };
    });
  },
  reportTeams: { correct: 'Data Protection Officer (DPO) & Legal Team', incorrect: 'Catering Team' },
  completionText(mode, scenario) {
    return `<div class="result-card"><h3>WHAT IS DATA EXFILTRATION?</h3>
    <p>Imagine someone secretly photocopying all the important documents in your school office and smuggling them out in their backpack at 3am. Data exfiltration is doing the same — but with digital files.</p>
    <p style="margin-top:8px;">Key red flags: transfers at odd hours, to personal accounts or external drives, files way bigger than usual, and sensitive file types (like spreadsheets with customer data). The time of day is a huge clue — 3am uploads to personal Dropbox are never legitimate!</p></div>`;
  }
};

// ─────────────────────────────────────────────────────────────
// MODULE 8: ZERO-DAY / VULNERABILITY SCAN
// ─────────────────────────────────────────────────────────────
MODULES.vulnerabilityScan = {
  id: 'vulnerabilityScan',
  name: 'VULNERABILITY SCAN',
  emailSender: () => pick(['vuln@patchops.net','scanner@secaudit.io','cve@threatintel.com']),
  emailSubject: () => pick(['Vulnerability Scan Results Ready','CVE Alert: Unpatched Systems Detected','Patch Compliance Report','Security Audit: Action Required']),
  emailBody() {
    return pick([
      `Hi,\n\nOur automated vulnerability scanner has completed its sweep. Several systems may have unpatched vulnerabilities. Please review the findings using the Vulnerability Scanner Dashboard.\n\nPatch Ops`,
      `Hello,\n\nRecent CVE advisories match some software versions running in our environment. Please load the Vulnerability Scanner Dashboard and assess the risk level for each finding.\n\nThreat Intel`,
      `Hi Agent,\n\nSecurity audit flagged several systems that may be missing critical patches. Some of these could be exploited by attackers. Please review and prioritise patching.\n\nSecurity Audit`
    ]);
  },
  tools: {
    correct: 'Vulnerability Scanner Dashboard',
    decoys: ['DLP Monitor','Authentication Log Viewer','Network Traffic Monitor','Email Header Analyser','Bandwidth Checker']
  },
  generateScenario() {
    const systems = [
      { name: 'Web Server (Apache 2.4.49)', purpose: 'Public web hosting' },
      { name: 'Windows Server 2019 R1', purpose: 'Active Directory controller' },
      { name: 'MySQL 8.0.26', purpose: 'Production database' },
      { name: 'OpenSSL 1.0.2 (legacy)', purpose: 'Encryption library' },
      { name: 'pfSense Firewall 2.5.1', purpose: 'Network perimeter firewall' },
      { name: 'Ubuntu 20.04 LTS', purpose: 'App server' },
      { name: 'VMware ESXi 7.0.0', purpose: 'Virtualisation host' },
    ];

    const cveSeverities = ['CRITICAL','HIGH','MEDIUM','LOW'];
    const chosen = shuffle(systems).slice(0, 5);

    return chosen.map((sys, i) => {
      const cvssScore = parseFloat(randFloat(0, 10, 1));
      const severity = cvssScore >= 9 ? 'CRITICAL' : cvssScore >= 7 ? 'HIGH' : cvssScore >= 4 ? 'MEDIUM' : 'LOW';
      const patchAvailable = Math.random() > 0.2;
      const daysSincePatch = patchAvailable ? randInt(0, 180) : null;
      const cveId = `CVE-${randInt(2020,2024)}-${randInt(1000,99999)}`;
      const exploitInWild = cvssScore >= 8 && Math.random() > 0.4;

      let ragAnswer, actionAnswer;
      if (exploitInWild || severity === 'CRITICAL') {
        ragAnswer = 'R'; actionAnswer = 'patchNow';
      } else if (severity === 'HIGH') {
        ragAnswer = 'A'; actionAnswer = 'schedulePatch';
      } else {
        ragAnswer = 'G'; actionAnswer = 'ignore';
      }

      return {
        name: sys.name,
        purpose: sys.purpose,
        cveId,
        cvssScore,
        severity,
        patchAvailable,
        daysSincePatch,
        exploitInWild,
        ragAnswer, actionAnswer,
        notes: exploitInWild ? '⚠ EXPLOIT FOUND IN THE WILD — patch IMMEDIATELY.' : severity === 'LOW' ? 'Low risk — schedule routine patch.' : `CVSS ${cvssScore}: ${severity} risk.`,
        handled: false, userRag: null, userAction: null
      };
    });
  },
  reportTeams: { correct: 'Patch Management & Change Advisory Board', incorrect: 'Social Media Team' },
  completionText(mode, scenario) {
    return `<div class="result-card"><h3>WHAT IS A VULNERABILITY?</h3>
    <p>A vulnerability is like a broken lock on a door. The CVE database is like a public notice board where security researchers post details of every known broken lock, so companies can fix them. Attackers read the same board!</p>
    <p style="margin-top:8px;">The CVSS score goes from 0 to 10 — think of it like a danger score. A 9.8 CRITICAL means the lock is basically wide open. If there's already an exploit "in the wild", it means attackers are already through the door. Patch fast!</p></div>`;
  }
};

// Export module list for engine
var MODULE_LIST = ['ddos','malware','sqli','ransomware','phishingHarvest','mitm','insiderThreat','vulnerabilityScan'];

// Build tool options for dropdown
function getToolOptions(moduleId) {
  const mod = MODULES[moduleId];
  if (!mod) return [];
  const decoys = shuffle(mod.tools.decoys).slice(0, 2);
  return shuffle([mod.tools.correct, ...decoys]);
}

// DATA COLUMN CONFIG per module
var MODULE_COLUMNS = {
  ddos: [
    { key: 'name', label: 'SERVICE' },
    { key: 'avgHitsMin', label: 'AVG /MIN' },
    { key: 'currentHitsMin', label: 'CURRENT /MIN' }
  ],
  malware: [
    { key: 'name', label: 'PROCESS' },
    { key: 'cpu', label: 'CPU %' },
    { key: 'memMB', label: 'MEM (MB)' },
    { key: 'networkKBs', label: 'NET KB/s' }
  ],
  sqli: [
    { key: 'name', label: 'ENDPOINT' },
    { key: 'payload', label: 'LAST PAYLOAD' },
    { key: 'requestsPerMin', label: 'REQ/MIN' },
    { key: 'statusCodes', label: 'STATUS' }
  ],
  ransomware: [
    { key: 'name', label: 'DRIVE/SHARE' },
    { key: 'encryptedFiles', label: 'ENCRYPTED' },
    { key: 'writeOpsMin', label: 'WRITES/MIN' },
    { key: 'newExtensions', label: 'NEW EXT' }
  ],
  phishingHarvest: [
    { key: 'name', label: 'ACCOUNT' },
    { key: 'failedLogins', label: 'FAILED LOGINS' },
    { key: 'uniqueIPs', label: 'UNIQUE IPs' },
    { key: 'timeSpanMins', label: 'TIME SPAN (m)' }
  ],
  mitm: [
    { key: 'name', label: 'CONNECTION' },
    { key: 'certAuthority', label: 'CERT AUTH' },
    { key: 'tlsVersion', label: 'TLS VER' },
    { key: 'daysToExpiry', label: 'DAYS EXPIRY' }
  ],
  insiderThreat: [
    { key: 'name', label: 'USER' },
    { key: 'dataTransferGB', label: 'TRANSFER (GB)' },
    { key: 'destination', label: 'DESTINATION' },
    { key: 'timeOfDay', label: 'TIME' }
  ],
  vulnerabilityScan: [
    { key: 'name', label: 'SYSTEM' },
    { key: 'cveId', label: 'CVE ID' },
    { key: 'cvssScore', label: 'CVSS SCORE' },
    { key: 'severity', label: 'SEVERITY' }
  ]
};

// ACTION BUTTONS per module
var MODULE_ACTIONS = {
  ddos: [
    { id: 'block', label: 'BLOCK TRAFFIC', cls: 'btn-block' },
    { id: 'throttle', label: 'THROTTLE', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  malware: [
    { id: 'quarantine', label: 'QUARANTINE', cls: 'btn-block' },
    { id: 'investigate', label: 'INVESTIGATE', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  sqli: [
    { id: 'block', label: 'BLOCK IP', cls: 'btn-block' },
    { id: 'investigate', label: 'FLAG & MONITOR', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  ransomware: [
    { id: 'isolate', label: 'ISOLATE DRIVE', cls: 'btn-block' },
    { id: 'investigate', label: 'MONITOR CLOSELY', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  phishingHarvest: [
    { id: 'lockAccount', label: 'LOCK ACCOUNT', cls: 'btn-block' },
    { id: 'forceReset', label: 'FORCE PWD RESET', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  mitm: [
    { id: 'revokeBlock', label: 'REVOKE & BLOCK', cls: 'btn-block' },
    { id: 'investigate', label: 'FLAG & INVESTIGATE', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  insiderThreat: [
    { id: 'lockAccount', label: 'LOCK ACCOUNT', cls: 'btn-block' },
    { id: 'investigate', label: 'FLAG FOR REVIEW', cls: 'btn-throttle' },
    { id: 'ignore', label: 'IGNORE (OK)', cls: 'btn-ignore' }
  ],
  phishingModule: [
    { id: 'report', label: '🚩 REPORT PHISHING', cls: 'btn-block' },
    { id: 'ignore', label: '✅ DELIVER (GENUINE)', cls: 'btn-ignore' }
  ],
  bruteForce: [
    { id: 'lockAccount', label: '🔒 LOCK ACCOUNT', cls: 'btn-block' },
    { id: 'investigate', label: '🔍 INVESTIGATE', cls: 'btn-throttle' },
    { id: 'ignore', label: '✅ NORMAL ACTIVITY', cls: 'btn-ignore' }
  ],
  socialEng: [
    { id: 'block', label: '🚫 BLOCK & REPORT', cls: 'btn-block' },
    { id: 'investigate', label: '🔍 VERIFY FIRST', cls: 'btn-throttle' },
    { id: 'ignore', label: '✅ LEGITIMATE', cls: 'btn-ignore' }
  ],
  usbDrop: [
    { id: 'quarantine', label: '🔌 QUARANTINE PC', cls: 'btn-block' },
    { id: 'investigate', label: '🔍 INVESTIGATE', cls: 'btn-throttle' },
    { id: 'ignore', label: '✅ AUTHORISED', cls: 'btn-ignore' }
  ],
  vulnerabilityScan: [
    { id: 'patchNow', label: 'PATCH NOW', cls: 'btn-block' },
    { id: 'schedulePatch', label: 'SCHEDULE PATCH', cls: 'btn-throttle' },
    { id: 'ignore', label: 'LOW RISK - SKIP', cls: 'btn-ignore' }
  ]
};

// ─────────────────────────────────────────────────────────────
// MODULE 9: PHISHING IDENTIFIER
// (dedicated module — students examine a batch of incoming emails
//  and must decide which are real and which are phishing)
// ─────────────────────────────────────────────────────────────
MODULES.phishingModule = {
  id: 'phishingModule',
  name: 'PHISHING IDENTIFIER',
  emailSender: () => pick(['security@mailguard.net','phishing-reports@soc.io','awareness@cybersec.com']),
  emailSubject: () => pick(['Phishing Drill: Review These Emails','Suspicious Email Batch — Your Assessment Needed','Email Security Check: Flag the Phish']),
  emailBody(scenario) {
    return pick([
      `Hi Agent,\n\nWe've intercepted a batch of emails before they reached staff inboxes. Some are legitimate, some are phishing attempts. Please load the Email Header Analyser and flag anything suspicious.\n\nRemember: when in doubt, REPORT it!\n\nMailGuard`,
      `Hello,\n\nAs part of our regular phishing awareness programme, please review the following batch of emails and identify which ones are phishing attempts.\n\nUse the Email Header Analyser tool.\n\nCyberSec Team`,
      `Hi,\n\nWe've had reports that phishing emails are circulating. We've captured a batch for analysis. Can you review them and identify the real ones from the fakes?\n\nSOC Team`,
    ]);
  },
  tools: {
    correct: 'Email Header Analyser',
    decoys: ['Network Traffic Monitor','Process Monitor','DLP Monitor','Vulnerability Scanner Dashboard','Authentication Log Viewer']
  },
    generateScenario(params={}) {
    const {numEscalations=pick([0,1,2,2,3]),numItems=6}=params;
    const numPhish=Math.min(numEscalations,numItems-1);
    const numReal=numItems-numPhish;
    const realPool=[{from:'hr@company.com',subject:'Updated Holiday Policy',body:'Hi team,\n\nThe updated holiday booking policy is attached.\n\nHR Team',phishing:false},{from:'it@company.com',subject:'Maintenance Tonight 11pm–2am',body:'Hi,\n\nServer maintenance tonight.\n\nIT Department',phishing:false},{from:'ceo@company.com',subject:'Team Meeting Next Friday',body:'Hi all,\n\nAll-hands at 10am next Friday.\n\nThanks',phishing:false},{from:'payroll@company.com',subject:'Your Payslip Is Ready',body:'Your payslip is in the HR portal.\n\nPayroll',phishing:false},{from:'helpdesk@company.com',subject:'Your Support Ticket Is Fixed',body:'Ticket #48821 resolved.\n\nIT Helpdesk',phishing:false},{from:'training@company.com',subject:'Reminder: Cybersecurity Training',body:'Your cybersecurity training is due.\n\nL&D',phishing:false},{from:'noreply@linkedin.com',subject:'You have 3 new connection requests',body:'Log in at linkedin.com to see them.',phishing:false}];
    const phishPool=[{from:'hr@c0mpany.com',subject:'URGENT: Update Your Bank Details NOW',body:'Update bank details in 24hrs or pay stops.',phishing:true,clue:"c0mpany.com — zero (0) not the letter O!"},{from:'it-support@company.helpdesk.xyz',subject:'Your Password Has Expired!',body:'Account locks in 1 hour!',phishing:true,clue:'Real address ends .com — .helpdesk.xyz is fake!'},{from:'security@paypa1.com',subject:'Your PayPal Account Is Suspended',body:'Verify now or account closed.',phishing:true,clue:"paypa1.com — the l is the number 1!"},{from:'admin@microsooft.com',subject:'Your Storage Is Almost Full',body:'Upgrade now.',phishing:true,clue:"microsooft.com — two Os! Real is microsoft.com"},{from:'noreply@amaz0n.co.uk',subject:'Your Order Has Been Cancelled',body:'Update your card details.',phishing:true,clue:'amaz0n.co.uk — zero instead of O!'},{from:'security-alert@g00gle.com',subject:'Someone Signed Into Your Account',body:'Secure your account: g00gle.com',phishing:true,clue:"g00gle.com — two zeros instead of Os!"},{from:'it@company.com.phishkit.ru',subject:'Password Reset Required',body:'Reset: company.com.phishkit.ru/reset',phishing:true,clue:'Real .com address has .phishkit.ru tacked on!'},{from:'hr@cornpany.com',subject:'Christmas Party Vote',body:'Vote: cornpany.com/party-vote',phishing:true,clue:"cornpany.com — corn instead of com!"}];
    const reals=shuffle(realPool).slice(0,numReal);
    const phishs=shuffle(phishPool).slice(0,numPhish);
    return shuffle([...reals,...phishs]).map(e=>({name:e.from,purpose:e.subject,body:e.body,domain:e.from.split('@')[1]||e.from,clue:e.clue||'Real company email',isPhish:e.phishing,ragAnswer:e.phishing?'R':'G',actionAnswer:e.phishing?'report':'ignore',notes:'',handled:false,userRag:null,userAction:null}));
  },
  emailBody(scenario) {
    return pick([
      `Hi Agent,\n\nWe caught a batch of emails before they got to people's inboxes. Some are real, some are FAKE — trying to trick people into clicking bad links.\n\nLoad the Email Header Analyser and spot the fakes! Tip: look VERY carefully at the sender address.\n\nMailGuard`,
      `Hello,\n\nSuspicious emails are going around! Can you check which ones are real and which are fakes (phishing)?\n\nUse the Email Header Analyser tool. Remember: hackers swap letters for numbers in email addresses!\n\nCyberSec Team`,
      `Hi,\n\nWe have a batch of emails that might include some fakes. Some look very convincing! Can you spot the dodgy ones?\n\nHint: the fake addresses always have a tiny mistake — a number instead of a letter, or an extra word.\n\nSOC Team`,
    ]);
  },
  tools: {
    correct: 'Email Header Analyser',
    decoys: ['Network Traffic Monitor','Process Monitor','File Integrity Monitor','Password Checker','Wi-Fi Scanner']
  },
  generateScenario() {
    const realSenders = [
      { from:'hr@company.com',            subject:'Updated Holiday Policy',          body:'Hi team,\n\nThe updated holiday booking policy is attached. Changes start 1st January.\n\nHR Team', phishing:false },
      { from:'it@company.com',            subject:'Maintenance Tonight 11pm–2am',    body:'Hi everyone,\n\nWe\'re doing server maintenance tonight. Some things might be slow for a bit.\n\nIT Department', phishing:false },
      { from:'ceo@company.com',           subject:'Team Meeting Next Friday',         body:'Hi all,\n\nReminder: all-hands meeting next Friday at 10am in the main room.\n\nThanks', phishing:false },
      { from:'payroll@company.com',       subject:'Your Payslip Is Ready',            body:'Hi,\n\nYour payslip is ready in the HR portal. Log in at hr.company.com.\n\nPayroll', phishing:false },
      { from:'helpdesk@company.com',      subject:'Your Support Ticket Is Fixed',     body:'Hi,\n\nYour IT support ticket #48821 has been fixed. Any questions, just reply!\n\nIT Helpdesk', phishing:false },
      { from:'training@company.com',      subject:'Reminder: Cybersecurity Training',  body:'Hi,\n\nYour annual cybersecurity training is due this month. Log in at learn.company.com.\n\nL&D Team', phishing:false },
      { from:'notifications@linkedin.com',subject:'You have 3 new connection requests',body:'You have new connection requests on LinkedIn. Log in at linkedin.com to see them.', phishing:false },
      { from:'noreply@github.com',        subject:'Review your account settings',      body:'Hi,\n\nWe noticed some unused SSH keys on your GitHub account. Please review them.\n\nGitHub Security', phishing:false },
    ];

    const phishSenders = [
      { from:'hr@c0mpany.com',              subject:'URGENT: Update Your Bank Details NOW', body:'You MUST update your bank details in the next 24 hours or your pay will stop.\n\nClick: http://payroll-update.c0mpany.com\n\nHR Dept', phishing:true, clue:'c0mpany.com — that\'s a ZERO (0) not the letter O!' },
      { from:'it-support@company.helpdesk.xyz', subject:'Your Password Has Expired!',    body:'Your password expired 2 days ago! Your account will lock in 1 hour!\n\nReset: http://company.helpdesk.xyz/reset\n\nIT Support', phishing:true, clue:'Real address is company.com — helpdesk.xyz is a fake!' },
      { from:'ceo@company-group.net',       subject:'Secret: Send Money Today',          body:'Hi, I need you to secretly transfer £8,500 to a new supplier today. Don\'t tell anyone. Reply for bank details.\n\nCEO', phishing:true, clue:'The CEO would NEVER secretly ask someone to send money by email!' },
      { from:'security@paypa1.com',         subject:'Your PayPal Account Is Suspended',   body:'Unusual activity found! Verify now or your account will be permanently closed:\n\nhttp://secure.paypa1.com/verify\n\n— PayPal Security', phishing:true, clue:'paypa1.com — the letter "l" has been replaced with the number 1!' },
      { from:'admin@microsooft.com',        subject:'Your Storage Is Almost Full',         body:'Your OneDrive is almost full. Upgrade now to avoid losing files:\n\nhttp://microsooft.com/upgrade\n\n— Microsoft', phishing:true, clue:'microsooft.com — two O\'s in Microsoft! The real address is microsoft.com' },
      { from:'noreply@amaz0n.co.uk',        subject:'Your Order Has Been Cancelled',       body:'Your order was cancelled due to a payment issue. Update your card:\n\nhttp://account.amaz0n.co.uk/billing\n\n— Amazon', phishing:true, clue:'amaz0n.co.uk — zero instead of the letter O!' },
      { from:'security-alert@g00gle.com',   subject:'Someone Signed Into Your Account',   body:'A suspicious login was detected. Secure your account now:\n\nhttp://g00gle.com/security\n\nGoogle Security', phishing:true, clue:'g00gle.com — two zeros instead of two O\'s!' },
      { from:'support@netfl1x.com',         subject:'Your Netflix Has Expired',           body:'Your Netflix subscription has expired. Update your payment now:\n\nhttp://account.netfl1x.com/billing\n\n— Netflix', phishing:true, clue:'netfl1x.com — the "i" in Netflix has been replaced with the number 1!' },
      { from:'it@company.com.phishkit.ru',  subject:'Password Reset Required',             body:'Your company password must be reset in 24 hours. Reset here:\n\nhttp://company.com.phishkit.ru/reset\n\nIT Department', phishing:true, clue:'The real address ends in company.com — but ".phishkit.ru" is added on the end to fool you!' },
      { from:'hr@cornpany.com',             subject:'Christmas Party Vote',                body:'Vote for the Christmas party venue here:\n\nhttp://cornpany.com/party-vote\n\nHR', phishing:true, clue:'cornpany.com — "corn" instead of "com" — the letters are mixed up!' },
    ];

    // numPhish can be 0 (all genuine), 1, 2, or 3
    const numPhish = pick([1, 2, 2, 2, 3]);
    const numReal  = 6 - numPhish;  // total always 6
    const reals    = shuffle(realSenders).slice(0, numReal);
    const phishs   = shuffle(phishSenders).slice(0, numPhish);
    const all      = shuffle([...reals, ...phishs]);

    return all.map(e => ({
      name:         e.from,
      purpose:      e.subject,
      body:         e.body,
      domain:       e.from.split('@')[1] || e.from,
      clue:         e.clue || 'Real company email',
      isPhish:      e.phishing,
      ragAnswer:    e.phishing ? 'R' : 'G',
      actionAnswer: e.phishing ? 'report' : 'ignore',
      notes:        ``,  // no note — child reads the FROM address directly
      handled:false, userRag:null, userAction:null,
    }));
  },
  reportTeams: { correct: 'IT Security & Awareness Team', incorrect: 'Accounts Payable Team' },
  completionText(mode, scenario) {
    return `<div class="rc info"><h3>HOW TO SPOT FAKE EMAILS</h3>
      <p>Fake emails always have a tiny mistake in the address. Look for: <strong>numbers replacing letters</strong> (g00gle, paypa1, netfl1x), <strong>extra words</strong> (company.helpdesk.xyz), or <strong>wrong endings</strong> (.net instead of .com).</p>
      <p style="margin-top:8px;">If it feels urgent or scary — "ACT NOW!" — that's a big red flag. Real companies don't threaten you.</p>
    </div>`;
  },
  plenary: {
    reportHint: 'These were fake emails — which team handles email security and teaches people to spot them?',
    analogy:      '🎣 Like a fishing hook with fake bait — the email looks real, but it\'s trying to hook you into giving away your password.',
    whatHappened: 'Fake emails had tiny mistakes in their addresses — a zero instead of an O, an extra word, one wrong letter — designed to trick people into clicking.',
    keyMove:      'Check every character in the address. One wrong letter = fake. If it feels urgent and scary — that\'s on purpose to make you panic and not think.',
    realWorld:    'You might get fake emails pretending to be Roblox, YouTube or your school. Always read the address carefully before clicking anything!',
    quiz: [
      { q: 'Which email address is fake?', options: ['hr@company.com', 'security@paypa1.com', 'it@company.com'], correct: 1 },
      { q: 'An email says "ACT NOW or your account is DELETED!" What\'s going on?', options: ['It\'s a real emergency — click fast! 😱', 'It\'s probably a phishing trick — check the address first 🔍', 'Reply to ask if it\'s real ✉️'], correct: 1 },
      { q: 'Why do phishing emails use urgent language?', options: ['Because the sender is very busy ⏰', 'To make you panic so you click without thinking 😨', 'Because that\'s how professional emails work 💼'], correct: 1 },
      { q: 'What should you NEVER share in an email?', options: ['Your name 👤', 'Your password 🔑', 'The date 📅'], correct: 1 },
      { q: 'Is "support@amazon.co.uk.fakesite.com" really Amazon?', options: ['Yes — it starts with amazon ✅', 'No — the real domain is fakesite.com 🔴', 'Only if it looks official 💼'], correct: 1 },
      { q: 'Why do phishing emails pretend to be from banks or PayPal?', options: ['Because hackers like money 💰', 'Because people trust them and act fast without checking 🏦', 'Because it is the law 📜'], correct: 1 },
      { q: 'An email has a perfect logo and no spelling mistakes. Can it still be phishing?', options: ['No — bad spelling is always the giveaway ✍️', 'Yes — attackers can copy logos and write well 🎨', 'Only if it came from abroad 🌍'], correct: 1 },
      { q: 'What is "spear phishing"?', options: ['Phishing with a fishing rod 🎣', 'A targeted attack using your real name and details 🎯', 'A type of DDoS attack 🌊'], correct: 1 },
      { q: 'What is the SAFEST thing to do with a suspicious email?', options: ['Click the link to check if it\'s real 🖱️', 'Report it without opening it 🚩', 'Forward it to friends to warn them 📤'], correct: 1 },
    ]
  },
};

// MODULE_LIST is set at the bottom of this file with all 5 modules

// Add columns for phishingModule
MODULE_COLUMNS.phishingModule = [
  { key: 'name',   label: 'FROM' },
  { key: 'domain', label: 'DOMAIN' },
  { key: 'purpose',label: 'SUBJECT' },
];

// Add actions for phishingModule
MODULE_ACTIONS.phishingModule = [
  { id: 'report', label: '🚩 REPORT (Fake!)', cls: 'btn-r' },
  { id: 'ignore', label: '✓ DELIVER (Real)', cls: 'btn-g' },
];

// Add columns and actions for ransomware (if not already present)
if (!MODULE_COLUMNS.ransomware) {
  MODULE_COLUMNS.ransomware = [
    { key: 'name',          label: 'DRIVE' },
    { key: 'encryptedFiles',label: 'ENCRYPTED' },
    { key: 'writeOpsMin',   label: 'WRITES/MIN' },
    { key: 'newExtensions', label: 'NEW EXT' },
  ];
}
if (!MODULE_ACTIONS.ransomware) {
  MODULE_ACTIONS.ransomware = [
    { id: 'isolate',     label: '🔒 ISOLATE DRIVE', cls: 'btn-r' },
    { id: 'investigate', label: '🔍 INVESTIGATE',    cls: 'btn-a' },
    { id: 'ignore',      label: '✓ IGNORE (Normal)', cls: 'btn-d' },
  ];
}

// ─────────────────────────────────────────────────────────────
// MODULE 5: BRUTE FORCE ATTACK (rewritten for age 9)
// ─────────────────────────────────────────────────────────────
MODULES.bruteForce = {
  id: 'bruteForce',
  name: 'PASSWORD ATTACK',
  emailSender: () => pick(['alerts@loginwatch.net','monitor@secops.io','access-alerts@network.local']),
  emailSubject: () => pick(['Password Guessing Alert!','Login Attempts Spiking','Suspicious Login Activity Detected','Account Attack Warning']),
  emailBody() {
    return pick([
      `Hi,\n\nSomething weird is happening with our login system. Someone — or something — is trying to guess passwords really fast!\n\nCan you check which accounts are under attack using the Access Attempt Analyser?\n\nThanks,\nSecurity Team`,
      `Hello Agent,\n\nOur login monitor flagged some accounts getting hammered with password guesses. Some are fine, some look like a real attack.\n\nPlease load the Access Attempt Analyser and check each one!\n\nAccess Watch`,
      `Hi,\n\nAlert! Something is trying to break into accounts by guessing passwords over and over. Load the Access Attempt Analyser — look at how fast the attempts are and how many computers are doing it.\n\nLogin Monitor`,
    ]);
  },
  tools: {
    correct: 'Access Attempt Analyser',
    decoys: ['Network Traffic Monitor','File Integrity Monitor','Email Header Analyser','Process Monitor','Password Checker'],
  },
    generateScenario(params={}) {
    const {numEscalations=pick([1,2,2,2,3]),escalationType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']),includeEdgeCase=Math.random()>.3,numItems=6}=params;
    const accounts=[{name:'admin',purpose:'Main admin account'},{name:'j.henderson',purpose:'Staff account'},{name:'ceo',purpose:'CEO account'},{name:'svc_backup',purpose:'Backup service account'},{name:'k.okafor',purpose:'Staff account'},{name:'root',purpose:'Super-admin account'},{name:'reception',purpose:'Reception desk account'},{name:'s.mehta',purpose:'Staff account'},{name:'db_service',purpose:'Database account'}];
    const chosen=shuffle(accounts).slice(0,numItems);
    const rp=buildRagProfile(escalationType,numEscalations);
    const edgeAt=includeEdgeCase?numEscalations:-1;
    return chosen.map((acc,i)=>{
      if(rp[i]==='R'){const att=randInt(300,2000);const ips=randInt(1,2);const intv=randInt(20,150);return {name:acc.name,purpose:acc.purpose,attemptsPerMin:att,sourceIPs:ips,intervalMs:`~${intv}ms`,ragAnswer:'R',actionAnswer:'lockAccount',notes:`${att.toLocaleString()}/min from ${ips===1?'1 computer':ips+' computers'}, every ~${intv}ms.`,handled:false,userRag:null,userAction:null};}
      else if(rp[i]==='A'){const att=randInt(60,299);const ips=randInt(2,6);const intv=randInt(150,450);return {name:acc.name,purpose:acc.purpose,attemptsPerMin:att,sourceIPs:ips,intervalMs:`~${intv}ms`,ragAnswer:'A',actionAnswer:'investigate',notes:`${att}/min from ${ips} computers — attempts are fast and evenly spaced, like a robot.`,handled:false,userRag:null,userAction:null};}
      else if(i===edgeAt){const att=randInt(150,500);const intv=randInt(30,120);return {name:acc.name,purpose:acc.purpose,attemptsPerMin:att,sourceIPs:1,intervalMs:`~${intv}ms`,ragAnswer:'R',actionAnswer:'lockAccount',notes:'Account locked after loads of fast attempts — then a successful login! The attacker may have cracked the password. ⚠️',handled:false,userRag:null,userAction:null};}
      else{const att=randInt(1,6);const ips=randInt(3,15);return {name:acc.name,purpose:acc.purpose,attemptsPerMin:att,sourceIPs:ips,intervalMs:'Varied',ragAnswer:'G',actionAnswer:'ignore',notes:`Only ${att}/min spread across ${ips} devices — that's less than 1 wrong attempt per device. Just normal humans mistyping. Real bot attacks use 300+/min from 1-2 computers.`,handled:false,userRag:null,userAction:null};}
    });
  },
  reportTeams: {
    correct:   'Identity & Access Management (IAM) Team',
    incorrect: 'Facilities Management Team',
  },
  completionText(mode, scenario) {
    const attacked = scenario.filter(s => s.ragAnswer !== 'G');
    if (!attacked.length) {
      return `<div class="rc ok"><h3>✓ All Clear — logins look normal!</h3><p>Just the usual occasional mistype. Good check!</p></div>`;
    }
    return `<div class="rc info"><h3>PASSWORD ATTACK — KEY FACTS</h3>
      <p>A brute force attack uses a program to try thousands of passwords automatically — way faster than a human could type.</p>
      <p style="margin-top:8px;">Key clues: very high attempts, from very few IPs, with a robotic regular interval. Locking the account stops it even if the password hasn't been guessed yet.</p></div>`;
  },
  plenary: {
    reportHint:   'Password attacks are about breaking into accounts — which team manages who can log in?',
    analogy:      '🔑 Like trying every locker combination at school until one works — except a computer tries millions in seconds!',
    whatHappened: 'A program was automatically firing password guesses at our accounts, over and over, trying to break in.',
    keyMove:      'Very fast + very few IPs + clockwork timing = Lock it. Suspicious pattern = Investigate. Normal occasional typos = Leave it.',
    realWorld:    'This is why "password123" is dangerous — it would be cracked in seconds. A long random password takes years!',
    quiz: [
      { q: '800 login attempts per minute from 1 computer. What is it?', options: ['Normal — people type fast 🤷', 'A brute force attack 🔴', 'A DDoS attack 🌊'], correct: 1 },
      { q: 'Which password survives a brute force attack longest?', options: ['cat123 🐱', 'xK9#mQ2! 🔐', 'your birthday 🎂'], correct: 1 },
      { q: 'What is two-factor authentication (2FA)?', options: ['Using two passwords 🔑🔑', 'A second check (like a code on your phone) so stolen passwords alone don\'t work 📱', 'Having two email accounts 📧'], correct: 1 },
      { q: 'Why are long passwords better?', options: ['They are easier to remember 🧠', 'There are more combinations to try, so it takes much longer to guess 🔐', 'They look more professional 💼'], correct: 1 },
      { q: 'A locked account then shows a successful login. What does that mean?', options: ['The real user got lucky 🍀', 'The attacker may have guessed the password — investigate immediately! 🔴', 'The lock didn\'t work properly 🔒'], correct: 1 },
      { q: 'What is a "dictionary attack"?', options: ['Hacking using a dictionary 📖', 'Trying thousands of common words and passwords automatically 🔑', 'A very slow brute force attack 🐢'], correct: 1 },
      { q: 'What does "account lockout" do?', options: ['Permanently deletes the account 🗑️', 'Blocks the account after too many wrong passwords 🔒', 'Sends an email to the hacker 📧'], correct: 1 },
      { q: 'Why do attackers spread a brute force attack across many computers?', options: ['To make it run faster ⚡', 'So no single computer gets blocked — spreading makes it harder to stop 🌐', 'To avoid paying for one powerful computer 💸'], correct: 1 },
      { q: 'Which is the hardest password to brute force?', options: ['password123 🙈', 'YourPetName2024 🐶', 'k#9mQx!2vL@p 🔐'], correct: 2 },
    ]
  },
};

// ── MODULE POOL: 5 modules — engine picks 4 at random each session ──
MODULE_LIST.length = 0;
['ddos','malware','ransomware','phishingModule','bruteForce','socialEng','usbDrop'].forEach(m => MODULE_LIST.push(m));

MODULE_COLUMNS.bruteForce = [
  { key: 'name',           label: 'ACCOUNT' },
  { key: 'attemptsPerMin', label: 'ATTEMPTS/MIN' },
  { key: 'sourceIPs',      label: 'SOURCE IPs' },
  { key: 'intervalMs',     label: 'INTERVAL' },
];

MODULE_ACTIONS.bruteForce = [
  { id: 'lockAccount', label: '🔒 LOCK ACCOUNT',   cls: 'btn-r' },
  { id: 'investigate', label: '🔍 INVESTIGATE',    cls: 'btn-a' },
  { id: 'ignore',      label: '✓ IGNORE (Normal)', cls: 'btn-d' },
];

// ─────────────────────────────────────────────────────────────
// MODULE 6: SOCIAL ENGINEERING
// ─────────────────────────────────────────────────────────────
MODULES.socialEng = {
  id: 'socialEng',
  name: 'SOCIAL ENGINEERING',
  tools: {
    correct: 'Help Desk Log Analyser',
    decoys: ['Network Traffic Monitor','Process Monitor','File Integrity Monitor','Email Header Analyser','Access Attempt Analyser','USB Device Log'],
  },
  emailSender: () => pick(['security@infosec.io','alerts@staffwatch.net','hr-security@company.com']),
  emailSubject: () => pick(['Unusual Staff Request Flagged','Help Desk Alert: Suspicious Caller','Social Engineering Attempt Reported']),
  emailBody(scenario){
    return pick([
      `Hi,\n\nOur help desk has flagged some unusual requests today.\n\nSomeone appears to be trying to trick staff into handing over passwords or access by pretending to be someone they're not.\n\nPlease review the Help Desk Ticket Log below and decide which requests are genuine.\n\nSecurity Team`,
      `Hi,\n\nWe've had reports of people calling staff and pretending to be from IT Support, Microsoft, or even senior managers.\n\nThey're trying to get passwords or access to systems. Please check the ticket log and flag anything suspicious.\n\nIT Security`,
    ]);
  },
  tool: 'helpdesk',
  toolLabel: '🎭 HELP DESK LOG',
  briefing: {
    title: 'Social Engineering',
    tagline: 'Tricking people instead of hacking computers',
    summary: 'Sometimes hackers don\'t attack computers at all — they attack people! They call, email or even visit in person pretending to be someone trustworthy (like IT support or your boss) to trick you into giving them passwords or access. It\'s called "social engineering" because they\'re engineering (tricking) people, not machines.',
    watchFor: 'Urgent requests for passwords • Someone pretending to be IT, Microsoft or management • Requests that skip the normal process • Pressure to act quickly or secretly',
    realWorld: 'Famous hack: In 2020, Twitter was hacked when attackers called Twitter staff pretending to be IT, tricked them into giving access, and took over celebrity accounts including Elon Musk\'s.',
  },
  generateScenario(params={}){
    const {numEscalations=pick([1,2,2,2,3]),escalationType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']),includeEdgeCase=Math.random()>.3,numItems=6}=params;
    const tickets=[
      {caller:'Unknown — said they were from Microsoft',dept:'External',req:'Asked for the admin password so they could "fix a virus remotely"',process:'No ticket number. Called out of the blue.',rag:'R',action:'block',note:'Microsoft never calls to ask for your password.'},
      {caller:'Someone claiming to be the CEO',dept:'Unknown',req:'Asked receptionist to email them the staff payroll spreadsheet immediately',process:'Sent via personal Gmail, not company email. Said not to tell anyone.',rag:'R',action:'block',note:'Legitimate managers use company email and follow normal processes.'},
      {caller:'Said they were from IT Support',dept:'IT (unverified)',req:'Needed the Wi-Fi password for a "new employee" who hadn\'t been set up yet',process:'No help desk ticket. Sounded very urgent.',rag:'R',action:'block',note:'New employees are set up through HR. IT never asks for Wi-Fi passwords this way.'},
      {caller:'Someone claiming to be a new supplier',dept:'External',req:'Asked the finance team to update their bank details in the system',process:'Email came from a free Gmail account, not the supplier\'s usual address.',rag:'R',action:'block',note:'Bank detail changes must always be verified by phone using a known number.'},
      {caller:'Person at reception, no ID',dept:'Unknown',req:'Said they\'d left their access card at home and needed to be let in',process:'Not on the visitor list. No manager came to meet them.',rag:'A',action:'investigate',note:'Could be genuine but must be verified — never let in unverified visitors.'},
      {caller:'Caller claiming to be from the bank',dept:'External',req:'Said the company account had been frozen and needed login details to unfreeze it',process:'Wouldn\'t give a case reference number.',rag:'R',action:'block',note:'Banks never ask for your login details by phone.'},
      {caller:'Email from "HR"',dept:'Internal (unverified)',req:'Asking all staff to confirm their passwords for a "security audit"',process:'Email was from hr@company-helpdesk.com, not hr@company.com',rag:'R',action:'block',note:'Spot the fake domain — helpdesk.com not company.com.'},
      {caller:'Sarah from IT Support (known staff member)',dept:'IT',req:'Logged a ticket to reset a user\'s password following the standard process',process:'Proper ticket number. Verified via internal system.',rag:'G',action:'ignore',note:'Standard IT process followed correctly.'},
      {caller:'New employee James via line manager',dept:'HR',req:'Access badge being processed — manager requested temporary visitor badge',process:'HR ticket raised. Manager confirmed by phone.',rag:'G',action:'ignore',note:'Correct process followed through proper channels.'},
      {caller:'IT department',dept:'IT',req:'Scheduled password reset reminder sent to all staff (it\'s policy every 90 days)',process:'Sent from it@company.com with a proper ticket reference.',rag:'G',action:'ignore',note:'Legitimate scheduled process.'},
      {caller:'Priya from Finance (known staff)',dept:'Finance',req:'Asked IT to reset her own email password — she was locked out',process:'Called from her desk extension. IT verified her identity with security questions.',rag:'G',action:'ignore',note:'Verified identity through proper checks.'},
      {caller:'Facilities team',dept:'Facilities',req:'Emailed staff that the fire alarm test is at 2pm Thursday',process:'Sent from facilities@company.com. No links, no requests for info.',rag:'G',action:'ignore',note:'Normal internal notice — asks for nothing.'},
      {caller:'Cleaning supervisor (badged visitor)',dept:'External (approved)',req:'Signed in at reception for the regular evening clean',process:'On the pre-approved visitor list. Badge issued and logged.',rag:'A',action:'investigate',note:'Approved but always worth a quick check against the visitor list.'},
    ];
    const rp=buildRagProfile(escalationType,numEscalations);
    const reds=tickets.filter(t=>t.rag==='R');
    const ambs=tickets.filter(t=>t.rag==='A');
    const greens=tickets.filter(t=>t.rag==='G');
    const edgeItem=includeEdgeCase&&ambs.length?[pick(ambs)]:[];
    const redItems=shuffle(reds).slice(0,rp.filter(r=>r==='R').length);
    const ambItems=rp.filter(r=>r==='A').length>edgeItem.length?shuffle(ambs.filter(a=>!edgeItem.includes(a))).slice(0,rp.filter(r=>r==='A').length-edgeItem.length):[];
    const escalated=[...redItems,...ambItems,...edgeItem];
    const needed=numItems-escalated.length;
    const greenItems=shuffle(greens).slice(0,needed);
    return shuffle([...escalated,...greenItems]).map(t=>({
      name:t.caller,purpose:t.dept,
      request:t.req,process:t.process,
      ragAnswer:t.rag,actionAnswer:t.action,
      notes:t.note,
      handled:false,userRag:null,userAction:null,
    }));
  },
  columns:[
    {key:'name',      label:'CALLER / SENDER'},
    {key:'purpose',   label:'DEPT'},
    {key:'request',   label:'WHAT THEY WANTED'},
    {key:'process',   label:'HOW THEY ASKED'},
  ],
  actions:{R:'block',A:'investigate',G:'ignore'},
  actionLabels:{block:'🚫 BLOCK & REPORT',investigate:'🔍 VERIFY FIRST',ignore:'✅ LEGITIMATE'},
  ragRules:{
    R:'Asking for passwords / access / money — especially urgently or secretly → RED',
    A:'Unusual but not obviously fake — needs verification before acting → AMBER',
    G:'Follows proper process with verified identity → GREEN',
  },
  completionText(){
    return `<div class="rc info"><h3>SOCIAL ENGINEERING — KEY FACTS</h3>
    <p>Social engineers attack PEOPLE not computers. They use urgency, authority and trust to make you act without thinking.</p>
    <p style="margin-top:8px;"><strong>Remember the golden rules:</strong> Never give passwords to anyone who asks. Always verify identity through a different channel. Legitimate IT never needs your password.</p></div>`;
  },
  reportTeams:{correct:'Security Awareness Team',incorrect:'Facilities Management'},
  plenary:{
    analogy:'Social engineering is like a con artist in a film — they use a disguise and a convincing story to steal something, without ever needing to break down the door.',
    whatHappened:'Someone pretended to be trusted (IT, Microsoft, your boss) and tried to trick staff into giving away passwords or access.',
    keyRule:'Legitimate organisations NEVER ask for your password. If anyone does — it\'s a scam.',
    realWorld:'The 2020 Twitter hack used social engineering. Attackers called Twitter staff pretending to be IT, got access, and hijacked accounts with 100 million followers.',
    reportQ:'Who should you call first if you think someone is trying to social engineer you?',
    reportA:'Your IT Security or help desk team — straight away, before doing anything else.',
    quiz:[
      {q:'Microsoft calls you to say your computer has a virus and they need your password. What should you do?',options:['Give them the password so they can fix it 😬','Hang up — Microsoft never calls asking for passwords 📵','Check if your computer is slow first 🐢'],correct:1},
      {q:'Someone at the door says they\'re from IT and forgot their pass. What should you do?',options:['Let them in — they look friendly 😊','Call IT to verify before letting anyone in 📞','Ask them to wait and then ignore them 🤷'],correct:1},
      {q:'Your "boss" emails from a Gmail account asking for the payroll file urgently. What do you do?',options:['Send it — your boss needs it! 📧','Call your boss on their known number to check — bosses use company email 📞','Forward it just in case 🤷'],correct:1},
      {q:'Why do social engineers create urgency ("do it NOW!")?',options:['Because they\'re very busy people 🏃','So you act without thinking or checking 🧠','Because computers work faster when things are urgent ⚡'],correct:1},
      {q:'A caller says they\'re from your bank and need your login details to fix a problem. What do you do?',options:['Give them the details — it\'s the bank! 🏦','Hang up and call the bank back on the number on their website 📞','Wait to see if your account gets frozen 😬'],correct:1},
      {q:'What does "social engineering" mean?',options:['Building bridges and roads 🏗️','Tricking people instead of hacking computers 🎭','A type of computer virus 💻'],correct:1},
      {q:'Someone asks for your password to "test the system." What do you do?',options:['Give it — it\'s just a test ✅','Refuse — no legitimate test needs your actual password 🚫','Change your password then give them the old one 🔑'],correct:1},
      {q:'The safest thing to do when you\'re not sure if a request is genuine is:',options:['Just do what they ask to be helpful 😊','Verify through a different, trusted channel first 📞','Ask your friend what they think 👥'],correct:1},
      {q:'What makes social engineering attacks hard to spot?',options:['They happen very fast ⚡','They use real-looking details and sound convincing 🎭','They only happen at night 🌙'],correct:1},
    ],
  },
};

MODULE_COLUMNS.socialEng = [
  {key:'name',    label:'CALLER / SENDER'},
  {key:'purpose', label:'DEPARTMENT'},
  {key:'request', label:'WHAT THEY WANTED'},
  {key:'process', label:'HOW THEY ASKED'},
];

// ─────────────────────────────────────────────────────────────
// MODULE 7: USB DROP ATTACK
// ─────────────────────────────────────────────────────────────
MODULES.usbDrop = {
  id: 'usbDrop',
  name: 'USB DROP ATTACK',
  tools: {
    correct: 'USB Device Log',
    decoys: ['Network Traffic Monitor','Process Monitor','File Integrity Monitor','Email Header Analyser','Access Attempt Analyser','Help Desk Log Analyser'],
  },
  emailSender: () => pick(['alerts@usb-monitor.net','security@devicewatch.io','it-security@company.com']),
  emailSubject: () => pick(['Unknown USB Devices Detected','USB Security Alert','Suspicious Device Connections Logged']),
  emailBody(scenario){
    return pick([
      `Hi,\n\nOur security system has detected USB devices being plugged into company computers.\n\nHackers sometimes leave infected USB sticks in car parks or corridors hoping curious staff will plug them in.\n\nPlease review the USB Device Log and flag anything suspicious.\n\nIT Security`,
      `Hi,\n\nSeveral unknown USB devices have been plugged into computers today. This could be a USB drop attack — where hackers leave infected memory sticks around hoping someone picks them up.\n\nCheck the log below carefully.\n\nSecurity Operations`,
    ]);
  },
  tool: 'usb',
  toolLabel: '🔌 USB DEVICE LOG',
  briefing:{
    title:'USB Drop Attack',
    tagline:'The danger of unknown USB drives',
    summary:'A USB drop attack is when a hacker leaves infected USB drives (memory sticks) somewhere people will find them — like in a car park, reception, or on a desk. They\'re often labelled with something tempting, like \"Staff Bonuses\" or \"Confidential.\" That label is the trick — it makes even careful people curious enough to plug it in and find out what\'s inside. The moment they do, the malware can run and infect the computer.',
    watchFor:'Unknown device names • Devices that auto-run programs • USB sticks left in unusual places • New devices connected outside of working hours',
    realWorld:'In 2010, the Stuxnet worm — one of the most sophisticated cyberweapons ever built — spread via a USB drop into nuclear facilities in Iran. It worked precisely because someone trusted a USB stick they shouldn\'t have — proof that this trick works even in high-security places.',
  },
  generateScenario(params={}){
    const {numEscalations=pick([1,2,2,2,3]),escalationType=pick(['RED_AMBER','RED_AMBER','RED_RED','AMBER_AMBER']),includeEdgeCase=Math.random()>.3,numItems=6}=params;
    const devices=[
      {name:'USB_FOUND_CARPARK',type:'Unknown USB Stick',location:'Car park — found on the ground',time:'08:14',auto:'autorun.inf executed immediately',files:'setup.exe, update.bat',rag:'R',action:'quarantine',note:'Found outside + autorun = almost certainly malicious. Isolate the computer immediately.'},
      {name:'MYSTERY_STICK_001',type:'Unknown USB Stick',location:'Reception desk — no owner',time:'12:32',auto:'Tried to run hidden_update.exe',files:'hidden_update.exe, invoice.pdf (fake)',rag:'R',action:'quarantine',note:'Unknown device trying to run hidden executables. Classic USB drop attack.'},
      {name:'FREE_GIFT_USB',type:'USB Stick (branded "Free Gift")',location:'Conference room — left after meeting',time:'14:55',auto:'No autorun',files:'gift_voucher.exe (suspicious)',rag:'R',action:'quarantine',note:'Branded "free gift" USBs left at events are a classic delivery method for malware.'},
      {name:'UNKNOWN_DEVICE_02',type:'USB Stick',location:'Plugged into finance PC',time:'23:47',auto:'No autorun detected',files:'viewed 3 files then removed',rag:'A',action:'investigate',note:'After-hours + finance PC + unknown device = very suspicious even without autorun.'},
      {name:'VISITOR_USB_??',type:'Unknown device',location:'Meeting room PC',time:'09:22',auto:'No autorun',files:'accessed network drive briefly',rag:'A',action:'investigate',note:'Visitor USB accessing network drives needs investigation — this shouldn\'t happen.'},
      {name:'JIM_PERSONAL_USB',type:'Personal USB (staff member)',location:'Jim\'s workstation',time:'11:05',auto:'No autorun',files:'personal_photos.jpg, cv.docx',rag:'A',action:'investigate',note:'Personal USBs are against policy — could accidentally introduce malware even if not intentional.'},
      {name:'CORP_BACKUP_DRIVE',type:'Company Backup Drive (labelled)',location:'IT server room',time:'02:00',auto:'No autorun',files:'backup files only',rag:'G',action:'ignore',note:'Scheduled backup in IT room using labelled company equipment — expected.'},
      {name:'IT_INSTALL_DRIVE',type:'IT Department USB (labelled, asset tagged)',location:'IT Support desk',time:'10:30',auto:'No autorun',files:'software_install.msi (verified hash)',rag:'G',action:'ignore',note:'Labelled IT asset with verified software. Normal IT operation.'},
      {name:'ENCRYPTED_CORP_USB',type:'Company encrypted USB (IronKey)',location:'Finance Director\'s PC',time:'09:15',auto:'No autorun',files:'quarterly_report.xlsx',rag:'G',action:'ignore',note:'Company-issued encrypted USB used by authorised staff during working hours.'},
      {name:'IT_ASSET_4471',type:'Company USB (asset-tagged)',location:'Helpdesk PC',time:'10:48',auto:'No autorun',files:'driver_pack.zip (verified)',rag:'G',action:'ignore',note:'Tagged company asset used by IT during work hours.'},
      {name:'PRESENTER_USB',type:'Company presentation USB (labelled)',location:'Meeting room PC',time:'13:30',auto:'No autorun',files:'slides.pptx',rag:'G',action:'ignore',note:'Labelled company device used for a scheduled meeting.'},
    ];
    const rp=buildRagProfile(escalationType,numEscalations);
    const reds=devices.filter(d=>d.rag==='R');
    const ambs=devices.filter(d=>d.rag==='A');
    const greens=devices.filter(d=>d.rag==='G');
    const edgeItem=includeEdgeCase&&ambs.length?[pick(ambs)]:[];
    const redItems=shuffle(reds).slice(0,rp.filter(r=>r==='R').length);
    const ambItems=rp.filter(r=>r==='A').length>edgeItem.length?shuffle(ambs.filter(a=>!edgeItem.includes(a))).slice(0,rp.filter(r=>r==='A').length-edgeItem.length):[];
    const escalated=[...redItems,...ambItems,...edgeItem];
    const needed=numItems-escalated.length;
    const greenItems=shuffle(greens).slice(0,needed);
    return shuffle([...escalated,...greenItems]).map(d=>({
      name:d.name,purpose:d.type,
      location:d.location,time:d.time,
      autorun:d.auto,files:d.files,
      ragAnswer:d.rag,actionAnswer:d.action,
      notes:d.note,
      handled:false,userRag:null,userAction:null,
    }));
  },
  columns:[
    {key:'name',     label:'DEVICE ID'},
    {key:'purpose',  label:'TYPE'},
    {key:'location', label:'WHERE FOUND'},
    {key:'autorun',  label:'AUTO-RUN?'},
  ],
  actions:{R:'quarantine',A:'investigate',G:'ignore'},
  actionLabels:{quarantine:'🔌 QUARANTINE PC',investigate:'🔍 INVESTIGATE',ignore:'✅ AUTHORISED'},
  ragRules:{
    R:'Unknown device + autorun programs OR found in unusual location → RED',
    A:'Unknown or personal device without autorun — needs checking → AMBER',
    G:'Company-issued, labelled, authorised device → GREEN',
  },
  completionText(){
    return `<div class="rc info"><h3>USB DROP ATTACK — KEY FACTS</h3>
    <p>If you find a USB stick, do NOT plug it in — ever. Tell IT security instead. Curiosity is exactly what attackers are counting on.</p>
    <p style="margin-top:8px;"><strong>Remember:</strong> Autorun = instant infection. After-hours + unknown device = big red flag. Only use company-issued, labelled USB devices.</p></div>`;
  },
  reportTeams:{correct:'IT Security & Incident Response',incorrect:'Facilities Management'},
  plenary:{
    analogy:'A USB drop attack is like finding a sweet on the floor — it might look fine, but you have no idea what\'s in it or where it\'s been. Most sensible people wouldn\'t eat it. Don\'t plug in unknown USB sticks either!',
    whatHappened:'Someone left infected USB sticks around the building hoping a staff member would plug one in. The USB automatically ran malicious software the moment it was connected.',
    keyRule:'Never plug in a USB stick you didn\'t buy yourself or get from IT. If you find one, hand it to IT Security.',
    realWorld:'Stuxnet, discovered in 2010, used USB drop attacks to destroy nuclear centrifuges in Iran. It was the most sophisticated cyberweapon ever seen at the time.',
    reportQ:'You find a USB stick in the car park with "STAFF SALARIES 2024" written on it. What do you do?',
    reportA:'Hand it to IT Security immediately without plugging it in. The label is designed to make you curious!',
    quiz:[
      {q:'You find a USB stick in the car park. What do you do?',options:['Plug it in to see what\'s on it 🔌','Hand it straight to IT Security without plugging it in 🛡️','Keep it — finders keepers! 🎁'],correct:1},
      {q:'What makes a USB drop attack so effective?',options:['USB sticks are very fast ⚡','People are naturally curious and want to see what\'s on the drive 🤔','USB sticks are free 🆓'],correct:1},
      {q:'Why is an unknown USB stick dangerous even before you open any files?',options:['It uses up your battery faster 🔋','Malware on it can sometimes run automatically, or trick you into running it 💻','It can slow down your WiFi 📶'],correct:1},
      {q:'A USB stick with a label saying "WAGES - CONFIDENTIAL" is left on your desk. What should you do?',options:['Open it — it might be important! 📂','Report it to IT Security immediately without plugging it in 🚨','Leave it where it is and ignore it 🤷'],correct:1},
      {q:'Which USB stick is safe to plug in?',options:['A USB you found in the car park 🅿️','A USB given to you as a "free gift" at a conference 🎁','A company-issued, encrypted USB from your IT department 💼'],correct:2},
      {q:'Why might a hacker label a USB stick "STAFF SALARIES"?',options:['To be helpful and organised 📁','To make you curious so you plug it in 🤔','Because it actually contains salary information 💰'],correct:1},
      {q:'Stuxnet — one of the most powerful cyberweapons ever — used USB drop attacks. What did it destroy?',options:['The internet 🌐','Nuclear facility centrifuges in Iran ⚛️','Office printers 🖨️'],correct:1},
      {q:'An unknown USB drive is plugged into a finance computer at 2am. This is:',options:['Normal — maybe someone was working late 🌙','Very suspicious — investigate immediately 🔴','Fine as long as the files look normal 📄'],correct:1},
      {q:'Personal USB sticks (your own from home) in the office are:',options:['Fine — they\'re yours so you know they\'re safe ✅','Against policy and risky — they might carry malware from home 🚫','Only a problem if they have autorun 🔌'],correct:1},
    ],
  },
};

MODULE_COLUMNS.usbDrop = [
  {key:'name',     label:'DEVICE ID'},
  {key:'purpose',  label:'DEVICE TYPE'},
  {key:'location', label:'WHERE FOUND / CONNECTED'},
  {key:'autorun',  label:'AUTO-RUN DETECTED?'},
];
