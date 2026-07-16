/* ════════════════════════════════════════════════════════════
   CYBERSHIELD: ANALYST EDITION — chat-data_alevel.js
   Short, direct SOC team messages. Max 1–2 sentences each.
   ════════════════════════════════════════════════════════════ */

var PERSONAS = {
  zara:   { id:'zara',   name:'Zara K.'  },
  marcus: { id:'marcus', name:'Marcus T.' },
  priya:  { id:'priya',  name:'Priya S.' },
};

// ── GENERAL GROUP CHAT ────────────────────────────────────────
var GENERAL_GROUP_CHAT = {
  welcome: [
    { persona:'zara',   msgs:['Good to have another analyst on shift.','Welcome to the SOC. Glad to have the backup.','Hey — just in time. The alert queue is growing.'] },
    { persona:'marcus', msgs:['Welcome. We get real incidents here, not drills.','Good timing — another case just landed.','Another analyst on deck. Let\'s go.'] },
    { persona:'priya',  msgs:['We cover encryption, network security, databases and legislation. The full range.','The incidents are modelled on real cases. Useful preparation for exams too.','Glad you\'re here. It gets busy.'] },
  ],
  between: [
    { persona:'zara',   msgs:['Case closed. Check the inbox for the next one.','Good work. Refresh for the next alert.'] },
    { persona:'marcus', msgs:['On to the next. Inbox is waiting.','That\'s how it\'s done. Next case incoming.'] },
    { persona:'priya',  msgs:['Case complete. Refresh for the next alert.','Continue — there are more incidents in the queue.'] },
  ],
  idle: [
    { persona:'marcus', msgs:['Quiet window. Use it — they don\'t last long.','Quick question: what\'s the difference between symmetric and asymmetric encryption?','Make sure you can explain the TCP three-way handshake. Comes up a lot.'] },
    { persona:'zara',   msgs:['Calm before the next one.','Can you explain parameterised queries in one sentence? If yes, you\'re ready for SQL injection questions.','Remember: hashing is one-way. Encryption is two-way. That distinction matters.'] },
    { persona:'priya',  msgs:['Low volume right now. Stay alert.','Know your four Acts: CMA 1990, DPA 1998, CDPA 1988, RIPA 2000.','SHA-256 is a hash. AES-256 is a cipher. Both have 256 in the name — know the difference.'] },
  ],
};

// ── GLOBAL CHAT ───────────────────────────────────────────────
var GLOBAL_CHAT = {
  toolCorrect: [
    {persona:'marcus', msgs:['Right tool. ✅','Correct.','That\'s the one.','On target.']},
    {persona:'zara',   msgs:['Good call.','Correct tool. Proceed.','That\'s it. ✓']},
    {persona:'priya',  msgs:['Confirmed. Load and triage.','Correct.']},
  ],
  toolWrong: [
    {persona:'zara',   msgs:['Wrong tool — re-read the email. The incident type is your clue.','Check the email again. What category of threat is this?']},
    {persona:'marcus', msgs:['Not that one. The email tells you the incident type.','Have another look — match the tool to the incident.']},
    {persona:'priya',  msgs:['Incorrect. The incident type in the email determines the tool.']},
  ],
  actionCorrect: [
    {persona:'marcus', msgs:['✓','Correct.','Right call.','Good read.','Spot on.','Clean.','✓ +15 XP']},
    {persona:'zara',   msgs:['Correct. ✓','Good call.','Right.','Confirmed. ✓']},
    {persona:'priya',  msgs:['✓','Correct.','Right call.']},
  ],
  actionWrong: [
    {persona:'zara',   msgs:['Not quite — look at the key indicator again.','Check the detail in that item.']},
    {persona:'marcus', msgs:['Incorrect. What makes this one different?','Look more carefully at the specifics.']},
    {persona:'priya',  msgs:['Wrong. What is the defining characteristic of this item?','Re-read the item — the answer is in there.']},
  ],
  allHandled: [
    {persona:'marcus', msgs:['All items assessed. Final step: report to the right team. 📋']},
    {persona:'zara',   msgs:['All handled. Who picks this up?']},
  ],
  reportCorrect: [
    {persona:'zara',   msgs:['Correct team. ✓','Right escalation path.']},
    {persona:'marcus', msgs:['Correct! 💪','That\'s the one.']},
  ],
  reportWrong: [
    {persona:'priya',  msgs:['Wrong team — think about who handles this incident type.']},
    {persona:'zara',   msgs:['Not that team. Match it to the incident category.']},
  ],
  scenarioComplete: [
    {persona:'zara',   msgs:['Good work. Next alert in the inbox.']},
    {persona:'marcus', msgs:['On to the next! 📨']},
    {persona:'priya',  msgs:['Case closed. Refresh for the next incident.']},
  ],
};

// ── MODULE-SPECIFIC CHAT ──────────────────────────────────────
var MODULE_GROUP_CHAT = {};

// ── PACKET CAPTURE ANALYSIS ───────────────────────────────────
MODULE_GROUP_CHAT.packetAnalysis = {
  onLoad_1:[
    { persona:'priya',  msgs:['Network anomaly alert. Focus on TCP flags and packet rate.','NIDS has flagged several flows — some are attacks, some are legitimate traffic.'] },
    { persona:'marcus', msgs:['Packet capture triage. Rate + flags + source = full picture.'] },
  ],
  onLoad_2:[
    { persona:'zara',   msgs:['Check rate (abnormally high?), then flags (SYN without ACK?), then source behaviour.'] },
    { persona:'priya',  msgs:['One factor alone can mislead — high HTTPS from a CDN is fine; SYN-only from one IP is an attack.'] },
  ],
  onStuck:[
    { persona:'zara',   msgs:['Legitimate TCP needs SYN → SYN-ACK → ACK. Thousands of SYN with no ACK is a flood.'] },
    { persona:'priya',  msgs:['DNS amplification: small query, massive response. That asymmetry IS the attack.'] },
    { persona:'marcus', msgs:['Sequential ports at high rate = port scan. Nothing legitimate does that.'] },
    { persona:'zara',   msgs:['Tor exit node in the source field changes the risk profile even at low rate.'] },
  ],
  onHalfway:[
    { persona:'priya',  msgs:['Halfway. Not every flow is an attack — separating signal from noise is the skill.'] },
    { persona:'marcus', msgs:['Good progress. SYN flood, amplification, port scan — the classic DDoS and recon vectors.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Look at rate AND flags together — one without the other misleads.','What protocol is this? Different protocols have very different normal rate profiles.'] },
    { persona:'zara',   msgs:['Re-read the note — it explains the reasoning.'] },
    { persona:'marcus', msgs:['Check the source — Tor exit node in the source column changes the classification.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['All flows assessed. In a real SOC you\'d now document the IoCs and feed them back to threat intel.'] },
    { persona:'marcus', msgs:['SYN floods, amplification, port scans — all identified. That\'s network security in practice.'] },
  ],
};

// ── ENCRYPTION AUDIT ──────────────────────────────────────────
MODULE_GROUP_CHAT.encryptionAudit = {
  onLoad_1:[
    { persona:'priya',  msgs:['Crypto audit. Symmetric (shared key), asymmetric (public/private), hashing (one-way). Different algorithms, different purposes.','Some of these are broken, some weakening, some current. Know the difference.'] },
    { persona:'zara',   msgs:['It\'s not just the algorithm — the use case matters. AES on a database is fine. AES for passwords is wrong.'] },
  ],
  onLoad_2:[
    { persona:'priya',  msgs:['For each system: algorithm type, key size, and whether the use case is appropriate. All three matter.'] },
    { persona:'marcus', msgs:['Broken = replace now. Weakening = schedule. Current standard = maintain.'] },
  ],
  onStuck:[
    { persona:'priya',  msgs:['DES has a 56-bit key. Exhaustive search is feasible on commodity hardware today. Replace with AES-256.'] },
    { persona:'zara',   msgs:['Password hashing should use a slow algorithm designed for the purpose — fast general hashing algorithms are not suitable for passwords.'] },
    { persona:'marcus', msgs:['RSA security depends entirely on key size. RSA-512 can be factored in hours. NIST minimum is 2048.'] },
    { persona:'priya',  msgs:['SHA-1 had a practical collision attack published in 2017 (SHAttered). AMBER not RED — still some security, but schedule migration.'] },
  ],
  onHalfway:[
    { persona:'zara',   msgs:['Halfway. The exam question version: why is MD5 unsuitable for passwords? You\'re demonstrating the answer.'] },
    { persona:'priya',  msgs:['Good progress. In the real world this becomes a risk register entry with a remediation roadmap.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Is this broken (should not be in use at all) or just weakening? That\'s the RED vs AMBER distinction.'] },
    { persona:'zara',   msgs:['Check the use case. AES for a database backup is fine. AES for passwords is the wrong algorithm entirely.'] },
    { persona:'marcus', msgs:['Look at the last-updated date. Cryptographic standards evolve — a 2009 config may be critical in 2025.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['Audit complete. Symmetric, asymmetric, hashing — use cases mapped to algorithms. That\'s the exam topic in practice.'] },
    { persona:'marcus', msgs:['Password hashing should use a slow algorithm designed for the purpose — fast general hashing algorithms are not suitable for passwords.'] },
  ],
};

// ── SQL INJECTION DETECTION ───────────────────────────────────
MODULE_GROUP_CHAT.sqlInjection = {
  onLoad_1:[
    { persona:'priya',  msgs:['WAF alert. SQL injection: user input changes the query structure, not just the data values.','Key signatures: single quotes, comment sequences (--), OR with always-true condition, UNION SELECT.'] },
    { persona:'marcus', msgs:['Some are obvious attacks. The interesting ones are edge cases — an apostrophe in a surname looks like injection but isn\'t.'] },
  ],
  onLoad_2:[
    { persona:'zara',   msgs:['Focus on the submitted value. Does it contain SQL metacharacters AND attack syntax? Both matter.'] },
    { persona:'priya',  msgs:['O\'Brien has a single quote. That\'s not injection — context determines whether it\'s dangerous.'] },
  ],
  onStuck:[
    { persona:'zara',   msgs:['Ask: could this input change the structure of the SQL query, or is it just unusual data?'] },
    { persona:'priya',  msgs:['The -- sequence discards everything after it. WHERE password=\'anything\' becomes unreachable.'] },
    { persona:'marcus', msgs:['UNION SELECT appends a second query to the results — that\'s data exfiltration, not just bypass.'] },
    { persona:'zara',   msgs:['HTTP 500 after a quote often means the database returned an error — which means the app passed the input as code.'] },
  ],
  onHalfway:[
    { persona:'priya',  msgs:['Good progress. Distinguishing attack payloads from false positives is exactly what a real AppSec analyst does.'] },
    { persona:'marcus', msgs:['The fix is always parameterised queries — SQL code and user data sent separately.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Look at the submitted value. SQL metacharacters with attack syntax = RED. Unusual but benign input = GREEN.'] },
    { persona:'zara',   msgs:['Check the HTTP response code alongside the payload — a 200 OK after injection syntax is more worrying than a 400.'] },
    { persona:'marcus', msgs:['Base64-encoded SQL is obfuscation — someone testing whether the WAF can be bypassed. That\'s AMBER minimum.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['All log entries assessed. The defence is always parameterised queries — structurally separating code from data.'] },
    { persona:'marcus', msgs:['DROP TABLE, UNION SELECT, OR 1=1, xp_cmdshell — signatures covered. And O\'Brien: not an attack. That distinction is exam quality.'] },
  ],
};

// ── FIREWALL RULE REVIEW ──────────────────────────────────────
MODULE_GROUP_CHAT.firewallReview = {
  onLoad_1:[
    { persona:'priya',  msgs:['Firewall change requests. Apply least privilege — approve only what is strictly justified.','One misconfigured rule is all it takes. The SolarWinds attack started with a legitimate outbound rule used as a C2 channel.'] },
    { persona:'zara',   msgs:['Think like an attacker: which of these rules would you want approved?'] },
  ],
  onLoad_2:[
    { persona:'priya',  msgs:['For each rule: port, direction, source scope, and justification. All four.'] },
    { persona:'marcus', msgs:['High-risk ports: 22 (SSH), 3389 (RDP), 23 (Telnet), 5900 (VNC). Any open to 0.0.0.0/0 = reject.'] },
  ],
  onStuck:[
    { persona:'priya',  msgs:['0.0.0.0/0 = the entire internet. Every device globally. That\'s the attack surface you\'re opening.'] },
    { persona:'zara',   msgs:['Web servers in the DMZ should accept HTTPS from the internet — that\'s their purpose. Databases should not.'] },
    { persona:'marcus', msgs:['Port 3389 (RDP) exposed to the internet is a direct ransomware vector. Reject and require VPN first.'] },
    { persona:'priya',  msgs:['ESCALATE vs APPROVE: if the justification is vague or the scope too broad, escalate — don\'t approve and hope for the best.'] },
  ],
  onHalfway:[
    { persona:'zara',   msgs:['Good progress. Narrowest scope that meets the business need — that\'s least privilege in practice.'] },
    { persona:'priya',  msgs:['The goal: allow only what\'s necessary, block everything else.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Check port, direction, and source scope together. One factor alone can give the wrong answer.'] },
    { persona:'zara',   msgs:['0.0.0.0/0 means any internet address — /24 is 256 IPs, /16 is 65,536. Scope changes the risk level.'] },
    { persona:'marcus', msgs:['Is this the minimum necessary? If a /32 (one host) would work, a /24 should be escalated.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['Review complete. Every rejected or escalated rule reduces the attack surface. That\'s the job.'] },
    { persona:'marcus', msgs:['SSH/RDP to internet: rejected. All-ports outbound: rejected. HTTPS to DMZ web server: approved. Principle of least privilege, done.'] },
  ],
};

// ── LEGAL COMPLIANCE ──────────────────────────────────────────
MODULE_GROUP_CHAT.legalCompliance = {
  onLoad_1:[
    { persona:'priya',  msgs:['Legal incident review. CMA = police. DPA = ICO. CDPA = internal. RIPA = police. Get this mapping right.','CMA is criminal. DPA is regulatory. That distinction determines who you report to.'] },
    { persona:'zara',   msgs:['Intent doesn\'t negate CMA S1 liability — "investigating a bug" without authorisation is still unauthorised access.'] },
  ],
  onLoad_2:[
    { persona:'priya',  msgs:['For each incident: was access unauthorised? Was personal data mishandled? Was communication intercepted?'] },
    { persona:'marcus', msgs:['CMA S1 = unauthorised access (2yr max). S2 = access with intent (5yr). S3 = impairment/malware (10yr).'] },
  ],
  onStuck:[
    { persona:'priya',  msgs:['CMA S3 covers intentional impairment — installing a keylogger, deploying malware, deleting data without authority.'] },
    { persona:'zara',   msgs:['DPA Principle 5: don\'t keep personal data longer than necessary. Principle 7: appropriate security measures. Both are enforceable.'] },
    { persona:'marcus', msgs:['The CMA covers unauthorised access — even reading someone else\'s data without permission is an offence.'] },
    { persona:'priya',  msgs:['For the ambiguous ones: criminal intent? CMA. Personal data at risk? DPA. No clear criminal element? Internal.'] },
  ],
  onHalfway:[
    { persona:'zara',   msgs:['Good progress. Mapping incidents to legislation is exactly how exam scenario questions in this area work.'] },
    { persona:'priya',  msgs:['CMA = criminal (police). DPA = regulatory (ICO). That hierarchy determines the response every time.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Is this CMA (unauthorised computer access), DPA (personal data), or RIPA (interception)? Each maps to a different authority.'] },
    { persona:'zara',   msgs:['Criminal vs regulatory: if it\'s CMA or RIPA, the police. If it\'s DPA, the ICO. They\'re separate bodies.'] },
    { persona:'marcus', msgs:['Check the CMA section. S1, S2, S3 have different maximum sentences — the section affects how the case is handled.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['All incidents classified. CMA, DPA, CDPA, RIPA — the edge cases show the nuance the exam tests.'] },
    { persona:'marcus', msgs:['CMA to police, DPA to ICO, policy violations dealt with internally. That\'s the classification framework.'] },
  ],
};

// ── SOCIAL ENGINEERING ANALYSIS ───────────────────────────────
MODULE_GROUP_CHAT.socialEngineering = {
  onLoad_1:[
    { persona:'priya',  msgs:['Social engineering triage. The question isn\'t "is this technically possible?" — it\'s "does this bypass normal process?"','Some are clear attacks. Some need verification. Some are legitimate communications wrongly flagged.'] },
    { persona:'zara',   msgs:['Urgency, authority, secrecy — the psychological levers attackers use.'] },
  ],
  onLoad_2:[
    { persona:'marcus', msgs:['IT never asks for passwords. Finance never transfers money outside procurement. If those lines are crossed, it\'s an attack.'] },
    { persona:'priya',  msgs:['VERIFY means: call the person back on a number YOU know — not one they gave you.'] },
  ],
  onStuck:[
    { persona:'zara',   msgs:['Check the channel and the request together. Does this require bypassing a normal security process?'] },
    { persona:'priya',  msgs:['CEO fraud: the domain is one or two characters different. The email looks right, the address isn\'t.'] },
    { persona:'marcus', msgs:['Urgency is always a red flag. The more urgent the request, the more carefully you verify it.'] },
    { persona:'zara',   msgs:['Physical access: was it pre-booked? Is there a reference? Is there an escort? All three or reject.'] },
  ],
  onHalfway:[
    { persona:'marcus', msgs:['Halfway. GREEN cases all have something in common: correct channel, known process, nothing out of the ordinary.'] },
    { persona:'priya',  msgs:['Legitimate contacts tolerate verification delays. Attackers create urgency to prevent it.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Does this request bypass a normal security process? That\'s the core test.'] },
    { persona:'zara',   msgs:['Check the sender domain character by character. Lookalike domains are the most common BEC technique.'] },
    { persona:'marcus', msgs:['Urgency + secrecy together are manipulation tactics. Legitimate requests don\'t need both.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['All reports triaged. The universal defence: verify through a separate channel you control.'] },
    { persona:'marcus', msgs:['The 2020 Twitter hack used only phone calls. Social engineering often defeats technical controls entirely.'] },
  ],
};

// ── MALWARE BEHAVIOUR ANALYSIS ────────────────────────────────
MODULE_GROUP_CHAT.malwareAnalysis = {
  onLoad_1:[
    { persona:'priya',  msgs:['Endpoint security alert. For each flagged program, focus on three things: what it is doing, where it came from, and whether its network activity makes sense.','Ransomware encrypts files. Worms copy themselves to other devices. Trojans pretend to be something useful. Keyloggers capture what you type.'] },
    { persona:'marcus', msgs:['Some of these are genuine threats. Some are legitimate programs doing their jobs. Your job is to tell them apart.'] },
  ],
  onLoad_2:[
    { persona:'zara',   msgs:['For each entry: what is this program actually doing? Does that match what a legitimate version of it should do? Is it sending data somewhere unexpected?'] },
    { persona:'priya',  msgs:['Think about the malware types on the spec — ransomware, worm, trojan, virus, spyware, keylogger. What behaviour would each one show?'] },
  ],
  onStuck:[
    { persona:'priya',  msgs:['Look at what the program is doing: encrypting files, copying itself, recording keystrokes, or sending data out. Each of these points to a specific malware type.'] },
    { persona:'zara',   msgs:['Legitimate security software and backup tools do high-activity jobs too — the difference is they do it at scheduled times, to known destinations, and you installed them deliberately.'] },
    { persona:'marcus', msgs:['If a program is connecting to an external server at regular intervals and you did not install it, that is worth investigating.'] },
  ],
  onHalfway:[
    { persona:'marcus', msgs:['Halfway through. Remember: the GREEN items are real programs doing legitimate jobs. Not everything flagged is a threat.'] },
    { persona:'priya',  msgs:['Ransomware, worm, trojan, keylogger, spyware, virus — all on the OCR spec. Make sure you can identify each one from its behaviour.'] },
  ],
  onActionWrong:[
    { persona:'priya',  msgs:['Look again at what the program is actually doing — that is the key indicator. What malware type does that behaviour match?'] },
    { persona:'zara',   msgs:['Is the network activity consistent with what this program is supposed to do? Regular connections to an unknown external address are a red flag.'] },
    { persona:'marcus', msgs:['Think about the source: where did this program come from? Legitimate software comes from known publishers and official sources.'] },
  ],
  onAllHandled:[
    { persona:'priya',  msgs:['All processes triaged. Path + behaviour + network: those three tell the full story.'] },
    { persona:'marcus', msgs:['WannaCry combined worm propagation with ransomware encryption — that pattern in EDR logs (fast lateral spread + mass file writes) is exactly how you catch it early.'] },
  ],
};

// ── STUBS — kept for engine compatibility ─────────────────────
var PHISHING_EXCEPTION_CHAT = { onOpened:[], onReported:[] };
var IP_TRACE_CHAT            = { onStart:[], onHop:[], onExtend:[], onWin:[], onLose:[] };
