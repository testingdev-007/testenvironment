// ============================================================
// MODULES.JS — CyberShield Academy Simulation Modules
// ============================================================

const MODULES = {};

// ── Utility: seeded random helpers ──────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dp=1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function jitter(base, pct=0.15) { return Math.round(base * (1 + (Math.random()-0.5)*pct*2)); }

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
  generateScenario() {
    const services = [
      { name: 'Homepage', purpose: 'Main website people visit first' },
      { name: 'Login Page', purpose: 'Where people type their username and password' },
      { name: 'Image Loader', purpose: 'Sends pictures to the website' },
      { name: 'Search Bar', purpose: 'Lets people search for things' },
      { name: 'Shop Checkout', purpose: 'Where people pay for things' },
      { name: 'Admin Area', purpose: 'Secret area only staff can use' },
      { name: 'Video Stream', purpose: 'Plays videos on the site' },
    ];
    const chosen = shuffle(services).slice(0, 5);
    // Attack types — now with a 'productLaunch' edge case:
    // productLaunch = traffic looks high but it IS a real busy period — GREEN
    // Edge case: a service at exactly 10x (boundary!) — AMBER not RED
    // clean = all normal
    const attackType = pick(['volumetric','stealth','multi-vector','productLaunch','clean']);
    return chosen.map((svc, i) => {
      const baseline = randInt(150, 600);
      let current, ragAnswer, actionAnswer, notes;

      if (attackType === 'productLaunch') {
        if (i === 0) {
          const mult = randFloat(2.1, 2.8, 1);
          current = Math.round(baseline * mult);
          ragAnswer = 'A'; actionAnswer = 'throttle';
          notes = `${mult}× the usual amount — above the warning level, even with today's product launch.`;
        } else {
          current = jitter(baseline, 0.15);
          ragAnswer = 'G'; actionAnswer = 'ignore';
          notes = `${Math.round(current).toLocaleString()}/min — close to the ${baseline.toLocaleString()}/min average.`;
        }
      } else if (attackType === 'clean') {
        current = jitter(baseline, 0.1);
        ragAnswer = 'G'; actionAnswer = 'ignore';
        notes = `${Math.round(current).toLocaleString()}/min — close to the ${baseline.toLocaleString()}/min average.`;
      } else if (attackType === 'volumetric' && i === 0) {
        const mult = randInt(13, 35);
        current = baseline * mult;
        ragAnswer = 'R'; actionAnswer = 'block';
        notes = `${mult}× higher than normal right now.`;
      } else if (attackType === 'stealth' && i < 2) {
        const isBoundary = (i === 1);
        const mult = isBoundary ? randFloat(3.0, 3.4, 1) : randFloat(4.5, 8.0, 1);
        current = Math.round(baseline * mult);
        ragAnswer = 'A'; actionAnswer = 'throttle';
        notes = isBoundary
          ? `${mult}× the usual amount — just above the warning level.`
          : `${mult}× the usual amount right now.`;
      } else if (attackType === 'multi-vector' && i < 3) {
        if (i === 0) {
          const mult = randInt(11, 22);
          current = baseline * mult;
          ragAnswer = 'R'; actionAnswer = 'block';
          notes = `${mult}× higher than normal — main spike.`;
        } else {
          const mult = randFloat(3.5, 7.0, 1);
          current = Math.round(baseline * mult);
          ragAnswer = 'A'; actionAnswer = 'throttle';
          notes = `${mult}× the usual amount.`;
        }
      } else {
        current = jitter(baseline, 0.1);
        ragAnswer = 'G'; actionAnswer = 'ignore';
        notes = `${Math.round(current).toLocaleString()}/min — close to the ${baseline.toLocaleString()}/min average.`;
      }
      return {
        name: svc.name, purpose: svc.purpose,
        avgHitsMin: baseline, currentHitsMin: Math.round(current),
        ragAnswer, actionAnswer, notes,
        handled: false, userRag: null, userAction: null,
        graphData: this._generateGraphHistory(baseline, Math.round(current))
      };
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
  generateScenario() {
    // Processes — includes trickier edge cases:
    // - Legit-sounding name but unknown = RED (e.g. svch0st.exe — zero not O)
    // - High CPU but it's Windows Update = GREEN (edge case: legitimate reason)
    // - Low CPU but clearly fake name = RED (backdoors are sneaky!)
    const processes = [
      { name: 'svchost.exe',      legitimate: true,  cpuBase: 1.2, memBase: 48,   purpose: 'Windows system service (real)' },
      { name: 'chrome.exe',       legitimate: true,  cpuBase: 8,   memBase: 340,  purpose: 'Google Chrome browser' },
      { name: 'explorer.exe',     legitimate: true,  cpuBase: 0.8, memBase: 62,   purpose: 'Windows file explorer' },
      { name: 'svch0st.exe',      legitimate: false, cpuBase: 45,  memBase: 890,  purpose: '⚠️ NOT real! Zero instead of O — sneaky fake!', edgeCase: 'lookalike' },
      { name: 'WinUpdate.exe',    legitimate: true,  cpuBase: 55,  memBase: 620,  purpose: 'Windows Update (high CPU is normal when updating)', edgeCase: 'highCpuLegit' },
      { name: 'cryptminer.tmp',   legitimate: false, cpuBase: 92,  memBase: 1200, purpose: '⚠️ Suspicious name — not a real Windows program!' },
      { name: 'helper32.exe',     legitimate: false, cpuBase: 28,  memBase: 420,  purpose: '⚠️ Unknown origin — not found in software list' },
      { name: 'msedge.exe',       legitimate: true,  cpuBase: 6,   memBase: 280,  purpose: 'Microsoft Edge browser' },
      { name: 'backdoor_srv.exe', legitimate: false, cpuBase: 3,   memBase: 55,   purpose: '⚠️ Fake server — low CPU to hide, but the name gives it away!', edgeCase: 'lowCpuBad' },
      { name: 'antimalware.exe',  legitimate: true,  cpuBase: 2.1, memBase: 95,   purpose: 'Windows Defender (your antivirus)' }
    ];

    const chosen = shuffle(processes).slice(0, 5);
    const forceMalware = Math.random() > 0.2; // 80% chance of at least one bad process

    return chosen.map((proc, i) => {
      const cpu = jitter(proc.cpuBase, 0.15);
      const mem = jitter(proc.memBase, 0.12);
      const networkKBs = (!proc.legitimate) ? randInt(200, 4000) : randInt(0, 80);

      let ragAnswer, actionAnswer, notes;

      if (!proc.legitimate) {
        if (proc.edgeCase === 'lookalike') {
          ragAnswer = 'R'; actionAnswer = 'quarantine';
          notes = `Not recognised in the standard program list.`;
        } else if (proc.edgeCase === 'lowCpuBad') {
          ragAnswer = 'R'; actionAnswer = 'quarantine';
          notes = `Not a known Windows program. CPU is low — but the name gives it away.`;
        } else {
          ragAnswer = 'R'; actionAnswer = 'quarantine';
          notes = `Not a known Windows program.`;
        }
      } else if (proc.edgeCase === 'highCpuLegit') {
        ragAnswer = 'G'; actionAnswer = 'ignore';
        notes = `Windows Update.`;
      } else if (cpu > 70 && proc.legitimate) {
        ragAnswer = 'A'; actionAnswer = 'investigate';
        notes = `Real program but CPU is quite high right now (${cpu.toFixed(1)}%).`;
      } else {
        ragAnswer = 'G'; actionAnswer = 'ignore';
        notes = `Known Windows program.`;
      }

      return {
        name: proc.name, purpose: proc.purpose,
        cpu: parseFloat(cpu.toFixed(1)), memMB: mem, networkKBs,
        ragAnswer, actionAnswer, notes,
        handled: false, userRag: null, userAction: null
      };
    });
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
  generateScenario() {
    // EDGE CASES in this module:
    // 1. A drive showing high writes but it's a SCHEDULED BACKUP (should be IGNORE — not ransomware!)
    // 2. A drive with a very low encryption count but new suspicious extension (early-stage = AMBER/investigate)
    // 3. Full-blown ransomware = lots encrypted + suspicious extension = RED/isolate
    const drives = [
      { name: 'C:\\ System Drive',        purpose: 'Operating system and programs' },
      { name: 'D:\\ Documents Drive',     purpose: 'Staff documents and files' },
      { name: 'E:\\ Backup Share',        purpose: 'Nightly backup storage', isBackupDrive: true },
      { name: 'F:\\ Media Files',         purpose: 'Company photos and videos' },
      { name: '\\\\Server01\\HR',         purpose: 'HR files and records' },
      { name: '\\\\Server02\\Finance',    purpose: 'Finance spreadsheets' },
    ];

    const chosen = shuffle(drives).slice(0, 5);
    const attackStarted = Math.random() > 0.2;
    const attackDrive   = attackStarted ? randInt(0, 1) : -1;

    return chosen.map((drive, i) => {
      const isAttacked   = attackStarted && i <= attackDrive;
      const isFront      = isAttacked && i === attackDrive;
      const totalFiles   = randInt(1200, 45000);

      // Edge case: high writes on a backup drive but NOT ransomware
      const isNightlyBackup = drive.isBackupDrive && !isAttacked && Math.random() > 0.4;

      let encryptedFiles, newExtensions, writeOpsMin, ragAnswer, actionAnswer, notes;

      if (isNightlyBackup) {
        encryptedFiles = Math.round(totalFiles * randFloat(0.1, 0.3) / 100);
        newExtensions  = '.bak';
        writeOpsMin    = randInt(600, 3500);
        ragAnswer      = 'G'; actionAnswer = 'ignore';
        notes          = `Extension: .bak`;
      } else if (isAttacked && isFront) {
        const isEarlyStage = Math.random() > 0.5;
        if (isEarlyStage) {
          encryptedFiles = Math.round(totalFiles * randFloat(0.5, 4.0) / 100);
          newExtensions  = pick(['.locked','.encrypted','.WNCRY','.zepto']);
          writeOpsMin    = randInt(300, 900);
          ragAnswer      = 'A'; actionAnswer = 'investigate';
          notes          = `${encryptedFiles.toLocaleString()} files now have a "${newExtensions}" extension — that's not normal.`;
        } else {
          encryptedFiles = Math.round(totalFiles * randFloat(25, 75) / 100);
          newExtensions  = pick(['.locked','.encrypted','.WNCRY','.cerber','.crypted']);
          writeOpsMin    = randInt(2000, 8000);
          ragAnswer      = 'R'; actionAnswer = 'isolate';
          notes          = `${((encryptedFiles/totalFiles)*100).toFixed(0)}% of files encrypted. Extension: "${newExtensions}".`;
        }
      } else if (isAttacked) {
        encryptedFiles = Math.round(totalFiles * randFloat(0.85, 0.99));
        newExtensions  = pick(['.locked','.encrypted','.WNCRY','.zepto','.cerber','.crypted']);
        writeOpsMin    = randInt(800, 8000);
        ragAnswer      = 'R'; actionAnswer = 'isolate';
        notes          = `${((encryptedFiles/totalFiles)*100).toFixed(0)}% of files have the "${newExtensions}" extension.`;
      } else {
        encryptedFiles = Math.round(totalFiles * randFloat(0.1, 1.0) / 100);
        newExtensions  = 'None';
        writeOpsMin    = randInt(5, 55);
        ragAnswer      = 'G'; actionAnswer = 'ignore';
        notes          = ``;  // no note — data shown in columns
      }

      return {
        name: drive.name, purpose: drive.purpose,
        totalFiles, encryptedFiles, newExtensions, writeOpsMin,
        ragAnswer, actionAnswer, notes,
        handled: false, userRag: null, userAction: null
      };
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
const MODULE_LIST = ['ddos','malware','sqli','ransomware','phishingHarvest','mitm','insiderThreat','vulnerabilityScan'];

// Build tool options for dropdown
function getToolOptions(moduleId) {
  const mod = MODULES[moduleId];
  if (!mod) return [];
  const decoys = shuffle(mod.tools.decoys).slice(0, 2);
  return shuffle([mod.tools.correct, ...decoys]);
}

// DATA COLUMN CONFIG per module
const MODULE_COLUMNS = {
  ddos: [
    { key: 'name', label: 'SERVICE' },
    { key: 'avgHitsMin', label: 'AVG /MIN' },
    { key: 'currentHitsMin', label: 'CURRENT /MIN' },
    { key: 'notes', label: 'NOTE' }
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
const MODULE_ACTIONS = {
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
  generateScenario() {
    const realSenders = [
      { from:'hr@company.com',            subject:'Updated Holiday Policy',                   body:'Hi team,\n\nPlease find the updated holiday booking policy attached. Changes take effect from 1st January.\n\nHR Team', phishing:false },
      { from:'it@company.com',            subject:'Scheduled Maintenance Tonight 11pm–2am',   body:'Hi everyone,\n\nWe will be performing scheduled server maintenance tonight between 11pm and 2am. Some services may be briefly unavailable.\n\nIT Department', phishing:false },
      { from:'ceo@company.com',           subject:'All-Hands Meeting Next Friday',             body:'Hi all,\n\nJust a reminder that our quarterly all-hands meeting is next Friday at 10am in the main conference room.\n\nThanks', phishing:false },
      { from:'payroll@company.com',       subject:'Your Payslip Is Ready',                    body:'Hi,\n\nYour payslip for this month is now available in the HR portal. Log in at hr.company.com to view it.\n\nPayroll', phishing:false },
      { from:'newsletter@bbc.co.uk',      subject:'BBC News: Top Stories Today',              body:"Here are today's top stories from BBC News. Visit bbc.co.uk/news to read more.", phishing:false },
      { from:'training@company.com',      subject:'Mandatory Cybersecurity Training Reminder', body:'Hi,\n\nThis is a reminder that your annual cybersecurity awareness training is due this month. Please log in to the training portal at learn.company.com.\n\nL&D Team', phishing:false },
      { from:'helpdesk@company.com',      subject:'Your Support Ticket Has Been Resolved',    body:'Hi,\n\nYour IT support ticket #48821 has been resolved. If you have further questions please reply to this email.\n\nIT Helpdesk', phishing:false },
      { from:'notifications@linkedin.com',subject:'You have 3 new connection requests',       body:'You have new connection requests waiting on LinkedIn. Log in at linkedin.com to review them.', phishing:false },
      { from:'finance@company.com',       subject:'Q3 Budget Review — Please Review',         body:'Hi team,\n\nPlease review the attached Q3 budget summary before Thursday\'s finance meeting. Document is available in SharePoint.\n\nFinance Team', phishing:false },
      { from:'noreply@github.com',        subject:'[GitHub] Action required: Review your SSH keys', body:'Hi,\n\nWe noticed you have SSH keys on your GitHub account that haven\'t been used in over a year. Please review them at github.com/settings/keys.\n\nGitHub Security', phishing:false },
    ];

    const phishSenders = [
      { from:'hr@c0mpany.com',            subject:'URGENT: Update Your Bank Details NOW',     body:'Dear Employee,\n\nWe are updating payroll records. You MUST update your bank details within 24 hours or your salary will be delayed.\n\nClick here: http://payroll-update.c0mpany.com/login\n\nHR Dept', phishing:true, clue:'Misspelt domain: c0mpany.com (zero not the letter O)' },
      { from:'it-support@company.helpdesk.xyz', subject:'Your Password Has Expired — Reset Now', body:'URGENT: Your network password expired 2 days ago. Your account will be locked in 1 hour.\n\nReset here: http://company.helpdesk.xyz/reset\n\nIT Support', phishing:true, clue:'Domain is company.helpdesk.xyz — not the real company.com domain' },
      { from:'ceo@company-group.net',     subject:'Confidential: Wire Transfer Required Today', body:'Hi,\n\nI need you to urgently process a wire transfer of £8,500 to a new supplier. This is confidential — don\'t discuss with anyone else. Reply for bank details.\n\nCEO', phishing:true, clue:'CEO would never secretly ask staff to transfer money by email' },
      { from:'security@paypa1.com',       subject:'Your PayPal Account Has Been Suspended',   body:'Dear Customer,\n\nUnusual activity was detected on your account. Verify your identity immediately or your account will be permanently closed:\n\nhttp://secure.paypa1.com/verify\n\n— PayPal Security', phishing:true, clue:'Domain is paypa1.com — the letter l replaced with the number 1' },
      { from:'admin@microsooft.com',      subject:'Microsoft 365: Storage Almost Full',        body:'Your OneDrive storage is critically low. Upgrade immediately to avoid losing files:\n\nhttp://microsooft.com/storage-upgrade\n\n— Microsoft Team', phishing:true, clue:'microsooft.com — double O in Microsoft' },
      { from:'noreply@amaz0n.co.uk',      subject:'Your Order Has Been Cancelled',             body:'Dear Customer,\n\nYour recent order has been unexpectedly cancelled due to a payment issue. Please update your payment details immediately:\n\nhttp://account.amaz0n.co.uk/billing\n\n— Amazon Customer Service', phishing:true, clue:'amaz0n.co.uk — zero instead of the letter O' },
      { from:'accounts@comp4ny.com',      subject:'Invoice #INV-20948 — Payment Overdue',     body:'Dear Sir/Madam,\n\nYour account has an outstanding invoice of £3,240. Please make payment immediately to avoid legal action.\n\nDownload invoice: http://comp4ny.com/invoice\n\nAccounts Team', phishing:true, clue:'comp4ny.com — number 4 instead of letter A' },
      { from:'security-alert@g00gle.com', subject:'Suspicious Sign-In Detected on Your Account', body:'We detected a sign-in from an unrecognised device in Russia. If this was not you, secure your account immediately:\n\nhttp://g00gle.com/security/review\n\nGoogle Security Team', phishing:true, clue:'g00gle.com — double zero instead of double O' },
      { from:'hr@cornpany.com',           subject:'Christmas Party Venue Poll — Vote Now!',   body:'Hi all,\n\nPlease click the link below to vote for this year\'s Christmas party venue. Votes must be in by Friday!\n\nhttp://cornpany.com/party-vote\n\nHR', phishing:true, clue:'cornpany.com — corn instead of com (transposed letters)' },
      { from:'support@netfl1x.com',       subject:'Your Netflix Subscription Has Expired',    body:'Dear Member,\n\nYour Netflix subscription has expired. To continue watching, please update your payment details:\n\nhttp://account.netfl1x.com/billing\n\n— Netflix Support', phishing:true, clue:'netfl1x.com — number 1 instead of the letter i' },
      { from:'it@company.com.phishkit.ru',subject:'Password Reset Required — Action Needed',  body:'Dear User,\n\nYour company password must be reset within 24 hours as part of our security upgrade.\n\nReset here: http://company.com.phishkit.ru/reset\n\nIT Department', phishing:true, clue:'The real domain is company.com — phishkit.ru is appended after it to trick you' },
      { from:'noreply@dropb0x.com',       subject:'Someone Shared a File With You',           body:'A colleague has shared an important document with you on Dropbox.\n\nView file: http://dropb0x.com/shared/documents\n\nDropbox', phishing:true, clue:'dropb0x.com — zero instead of the letter O' },
    ];

    // Pick 2–4 real and 1–3 phishing, total 5 — shuffled so order is always different
    const numReal  = randInt(2, 4);
    const numPhish = 5 - numReal;
    const reals    = shuffle(realSenders).slice(0, numReal);
    const phishs   = shuffle(phishSenders).slice(0, numPhish);
    const all      = shuffle([...reals, ...phishs]);

    return all.map(e => ({
      name:     e.from,
      purpose:  e.subject,
      body:     e.body,
      domain:   e.from.split('@')[1] || e.from,
      clue:     e.clue || 'Legitimate company email',
      isPhish:  e.phishing,
      ragAnswer:   e.phishing ? 'R' : 'G',
      actionAnswer:e.phishing ? 'report' : 'ignore',
      notes:    e.phishing ? `⚠ PHISHING: ${e.clue}` : '✓ Legitimate email — safe to deliver',
      handled:false, userRag:null, userAction:null,
    }));
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

    const numReal  = randInt(2, 4);
    const numPhish = 5 - numReal;
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
  generateScenario() {
    const accounts = [
      { name: 'admin',       purpose: 'Main admin account' },
      { name: 'j.henderson', purpose: 'Staff account' },
      { name: 'ceo',         purpose: 'CEO account — very sensitive!' },
      { name: 'svc_backup',  purpose: 'Backup service account' },
      { name: 'k.okafor',    purpose: 'Staff account' },
      { name: 'root',        purpose: 'Super-admin account' },
      { name: 'reception',   purpose: 'Reception desk account' },
      { name: 's.mehta',     purpose: 'Staff account' },
      { name: 'db_service',  purpose: 'Database account' },
      { name: 'webserver',   purpose: 'Web server account' },
    ];

    const chosen = shuffle(accounts).slice(0, 5);
    const numAttacked = randInt(1, 3);

    return chosen.map((acc, i) => {
      const isAttacked    = i < numAttacked;
      // Edge case 1: account was locked AND then a successful login appeared
      const isCompromised = isAttacked && Math.random() > 0.65;
      // Edge case 2: lots of attempts but from MANY IPs — distributed / credential stuffing
      const isDistributed = isAttacked && !isCompromised && Math.random() > 0.6;

      let attemptsPerMin, sourceIPs, intervalMs, ragAnswer, actionAnswer, notes;

      if (!isAttacked) {
        attemptsPerMin = randInt(0, 7);
        sourceIPs      = randInt(3, 45);
        intervalMs     = 'Varied';
        ragAnswer = 'G'; actionAnswer = 'ignore';
        notes = `${attemptsPerMin}/min across ${sourceIPs} devices.`;

      } else if (isCompromised) {
        // Locked — then someone got in
        attemptsPerMin = randInt(150, 800);
        sourceIPs      = randInt(1, 2);
        intervalMs     = `~${randInt(30,200)}ms`;
        ragAnswer = 'R'; actionAnswer = 'lockAccount';
        notes = `Account locked after ${attemptsPerMin.toLocaleString()} rapid attempts — then a successful login appeared ⚠`;

      } else if (isDistributed) {
        // Many IPs but still suspicious — harder edge case
        attemptsPerMin = randInt(200, 900);
        sourceIPs      = randInt(60, 300);
        intervalMs     = 'Varied';
        ragAnswer = 'A'; actionAnswer = 'investigate';
        notes = `${attemptsPerMin.toLocaleString()}/min but from ${sourceIPs} different locations — coordinated but spread out.`;

      } else {
        // Classic brute force
        const interval = randInt(20, 250);
        attemptsPerMin = randInt(120, 2000);
        sourceIPs      = randInt(1, 3);
        intervalMs     = `~${interval}ms`;
        if (attemptsPerMin > 400 || sourceIPs === 1) {
          ragAnswer = 'R'; actionAnswer = 'lockAccount';
          notes = `${attemptsPerMin.toLocaleString()}/min from ${sourceIPs === 1 ? '1 computer' : sourceIPs+' computers'}, every ~${interval}ms.`;
        } else {
          ragAnswer = 'A'; actionAnswer = 'investigate';
          notes = `${attemptsPerMin.toLocaleString()}/min from ${sourceIPs} computers — attempts every ${interval}ms, looks robotic.`;
        }
      }

      return {
        name: acc.name, purpose: acc.purpose,
        attemptsPerMin, sourceIPs, intervalMs,
        ragAnswer, actionAnswer, notes,
        handled: false, userRag: null, userAction: null,
      };
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
      { q: 'Which password survives a brute force attack longest?', options: ["cat123 🐱", "xK9#mQ2! 🔐", "your birthday 🎂"], correct: 1 },
    ]
  },
};

// ── MODULE POOL: 5 modules — engine picks 4 at random each session ──
MODULE_LIST.length = 0;
['ddos','malware','ransomware','phishingModule','bruteForce'].forEach(m => MODULE_LIST.push(m));

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
