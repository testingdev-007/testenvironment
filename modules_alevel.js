/* ════════════════════════════════════════════════════════════
   CYBERSHIELD: ANALYST EDITION
   FILE: modules_alevel.js
   ROLE: Simulation content for A-Level students (16-18)
   SPEC: OCR A-Level Computer Science H446 v3.0
   ════════════════════════════════════════════════════════════

   Modules and spec coverage:
   1. packetAnalysis  — H446 §1.3.3  Networks, TCP/IP, firewalls
   2. encryptionAudit — H446 §1.3.1  Encryption & Hashing
   3. sqlInjection    — H446 §1.3.2  Databases & SQL
   4. firewallReview  — H446 §1.3.3  Firewalls & proxies
   5. legalCompliance — H446 §1.5.1  Computing legislation

   Accuracy checklist per scenario:
   ✓ Is this technically accurate?
   ✓ Is this in the OCR H446 spec?
   ✓ Is this positioned at A-Level standard?
   ════════════════════════════════════════════════════════════ */

var MODULES = {};

// ── Utility helpers ──────────────────────────────────────────
function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function randFloat(min,max,dp=1){return parseFloat((Math.random()*(max-min)+min).toFixed(dp));}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function jitter(base,pct=0.15){return Math.round(base*(1+(Math.random()-0.5)*pct*2));}
function _pickPool(pool,numR,numA,numG){
  const reds=shuffle(pool.filter(p=>p.ragAnswer==='R'));
  const ambs=shuffle(pool.filter(p=>p.ragAnswer==='A'));
  const grns=shuffle(pool.filter(p=>p.ragAnswer==='G'));
  const r=Math.min(numR,reds.length);
  const a=Math.min(numA,ambs.length);
  const g=Math.min(numG,grns.length);
  return shuffle([...reds.slice(0,r),...ambs.slice(0,a),...grns.slice(0,g)])
    .map(item=>({...item,handled:false,userRag:null,userAction:null}));
}

// ═══════════════════════════════════════════════════════════
// MODULE 1: NETWORK PACKET CAPTURE ANALYSIS
// H446 §1.3.3 — Networks, TCP/IP stack, security threats,
// firewalls, proxies, packet switching, DDoS
// ═══════════════════════════════════════════════════════════
MODULES.packetAnalysis = {
  id: 'packetAnalysis',
  name: 'PACKET CAPTURE ANALYSIS',

  emailSender: ()=>pick(['nids@secops.internal','siem-alerts@infrasec.net','noc@threatwatch.io','soc@cyberdefence.net']),
  emailSubject: ()=>pick(['NIDS Alert: Anomalous Traffic Pattern Detected','SIEM P1 Alert: Network Anomaly Requires Triage','Packet Capture Review — Analyst Action Required','NOC Alert: Suspicious Traffic Flows']),
  emailBody(){
    return 'Analyst,\n\nWe\'re supporting TechCorp Global\'s incident response. '
      +'Their NIDS captured network traffic during the 72-hour window before the confirmed breach.\n\n'
      +'Triage each flow: some may show the attacker\'s reconnaissance. '
      +'Identifying the initial scan pattern will help us reconstruct the attack timeline and timeline gaps.\n\n'
      +'Time-sensitive — legal counsel need a preliminary report within 4 hours.\n\n'
      +'Incident Response Lead';
  },
  diagnosticSummary:'Network traffic is broken into packets each with a header (source IP, destination IP, port, protocol) and a payload. TCP provides reliable ordered delivery via the three-way handshake SYN then SYN-ACK then ACK. UDP is connectionless and faster with no delivery guarantee. Ports identify services: 80=HTTP, 443=HTTPS, 22=SSH, 53=DNS. Firewalls filter by IP, port and protocol.',
  diagnosticQuestions:[
    {q:'What does TCP stand for',opts:['Transmission Control Protocol','Transfer Communication Protocol','Traffic Control Protocol'],ok:0,hint:'TCP provides reliable ordered delivery through connection acknowledgements.'},
    {q:'What is a network port number for',opts:['Identifying the physical cable being used','Identifying which service a packet is destined for','Identifying the hardware manufacturer of a device'],ok:1,hint:'Ports distinguish services — 80=HTTP, 443=HTTPS, 22=SSH, 53=DNS.'},
    {q:'UDP is connectionless — what does this mean',opts:['UDP acknowledges each packet before the next is sent','UDP maintains a persistent session between two hosts','UDP sends data without guaranteeing delivery or order'],ok:2,hint:'No handshake, no acknowledgements — UDP trades reliability for speed.'},
    {q:'What is a packet in networking',opts:['A formatted data unit with a header and payload','A persistent session between two communicating devices','A physical cable linking network switches'],ok:0,hint:'Messages are split into packets, independently routed, and reassembled at the destination.'},
    {q:'What does DNS do',opts:['Assigns IP addresses to devices on a network','Translates domain names into IP addresses','Encrypts traffic between a client and server'],ok:1,hint:'DNS is the internet\'s address book — without it you\'d need numeric IPs for every site.'},
    {q:'What is bandwidth',opts:['The number of devices a network can support simultaneously','The physical diameter of the network cable','The maximum data transfer rate of a network link'],ok:2,hint:'Higher bandwidth means more data per second — measured in bits per second.'},
    {q:'What does HTTPS stand for and what makes it different from HTTP',opts:['HyperText Transfer Protocol Secure — it encrypts the connection between browser and server using TLS','HyperText Transfer Protocol Standard — it uses a standard format for all web requests','HyperText Transfer Protocol Synchronised — it ensures all packets arrive in order'],ok:0,hint:'The S in HTTPS stands for Secure — the connection is encrypted using TLS so that data cannot be read if intercepted.'},
    {q:'How does packet switching route data',opts:['One continuous stream travels down a reserved circuit','Packets are routed independently and reassembled at destination','All packets must travel the same path in order'],ok:1,hint:'Packet switching is resilient — packets can route around failures and share capacity.'},
    {q:'What is a firewall\'s primary role',opts:['Assigning IP addresses to devices on the network','Encrypting all data passing through the network','Filtering network traffic based on configurable rules'],ok:2,hint:'Firewalls permit or deny traffic based on rules — IP, port, protocol, direction.'},
    {q:'What does ping measure',opts:['Whether a host is reachable and its round-trip latency','The bandwidth available on a network connection','The number of devices currently active on a network'],ok:0,hint:'Latency is measured in milliseconds — network diagnostic tools send a small packet and measure how long the reply takes.'},
    {q:'What is the TCP three-way handshake sequence',opts:['SYN — ACK — FIN','SYN — SYN-ACK — ACK','CONNECT — CONFIRM — READY'],ok:1,hint:'SYN=request, SYN-ACK=acknowledge+request, ACK=acknowledge. Connection established after all three.'},
    {q:'What does a router do in a network',opts:['It stores files and data for other computers on the network to access','It connects different networks and directs data packets to the correct destination','It amplifies the wireless signal so devices can connect from further away'],ok:1,hint:'Routers operate at the internet layer of TCP/IP — they read destination IP addresses and forward packets along the best path to the destination network.'},
    {q:'A static IP address means the address is',opts:['Permanently fixed and does not change','Shared across multiple devices on the same network','Automatically reassigned at each new login session'],ok:0,hint:'Servers need static IPs so clients can always find them.'},
    {q:'What is latency in networking',opts:['The rate at which a network transfers data per second','The delay between sending a request and receiving a reply','The number of errors occurring during transmission'],ok:1,hint:'Measured in milliseconds — high latency makes video calls and games feel sluggish.'},
    {q:'What distinguishes a LAN from a WAN',opts:['LANs use wireless only, WANs use only cables','LANs are public networks, WANs are always private','LANs cover a local area, WANs span larger distances'],ok:2,hint:'LAN = Local Area Network (building/campus). The internet is a WAN.'},
    {q:'What does a network switch do',opts:['Connects devices within the same network using MAC addresses','Routes packets between different networks using IP addresses','Filters traffic based on configurable security rules'],ok:0,hint:'Switches learn which device is on which port and direct traffic only to the intended recipient.'},
    {q:'What is a proxy server',opts:['A server that stores encrypted backups of all data','An intermediary that handles requests on behalf of clients','A server that assigns IP addresses to network devices'],ok:1,hint:'Proxies can filter content, cache responses, and hide internal network structure.'},
    {q:'What is a half-open TCP connection',opts:['A connection interrupted partway through data transfer','A connection that only transmits in one direction','A SYN received but the handshake not yet completed'],ok:2,hint:'SYN floods exploit this — the server allocates resources for each SYN, exhausting capacity.'},
    {q:'What is a network protocol',opts:['A set of rules governing how data is transmitted','A document specifying hardware requirements for devices','A cable standard for connecting network equipment'],ok:0,hint:'HTTP, TCP, IP, DNS are all protocols — each defines precise communication rules.'},
    {q:'A router\'s primary job is to',opts:['Block incoming threats using configurable security rules','Forward packets between different networks using IP addresses','Connect devices within the same network by MAC address'],ok:1,hint:'Routers operate at the network layer and determine the best path for packets.'}
  ],
  tools: {
    correct: 'Packet Capture Analyser',
    decoys: ['Encryption Audit Tool','SQL Query Log Viewer','Firewall Rule Manager','Legal Reference Database','Vulnerability Scanner','DNS Lookup Tool','Certificate Checker']
  },

  briefing: {
    title: 'Network Packet Capture Analysis',
    tagline: 'Triaging raw network flows for known attack signatures',
    summary: 'Every network communication is broken into packets: discrete units with a header (source IP, destination IP, protocol, port, flags) and payload. A Network Intrusion Detection System (NIDS) logs these flows. Key indicators: TCP SYN without ACK (SYN flood), sequential port increments (port scan), small queries generating large responses (amplification). Understanding the TCP three-way handshake (SYN → SYN-ACK → ACK) and what each flag signals is essential for distinguishing attacks from legitimate traffic.',
    watchFor: 'Very high packet rate from a single source IP • SYN flag set without corresponding ACK responses • Sequential destination port numbers (reconnaissance scan) • Asymmetric request/response sizes (amplification vector) • Source IPs on threat intelligence blocklists or Tor exit node registries • Internal hosts initiating unusual outbound high-volume connections',
    realWorld: 'In September 2016 the Mirai botnet, comprising 100,000+ compromised IoT devices, attacked DNS provider Dyn at 1.2 Tbps using SYN floods and UDP amplification — taking Twitter, Reddit and Netflix offline for hours. The same botnet had previously attacked journalist Brian Krebs at 620 Gbps. Both attacks exploited default credentials on cameras and DVRs.'
  },

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — clear attack signatures
      {
        name:'FLOW-A1', purpose:'TCP traffic from single external host',
        srcIP:'45.92.14.7', protocol:'TCP', dstPort:'80', rate:'47,200 pkts/sec', flags:'SYN (no ACK)',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Classic SYN flood: tens of thousands of SYN packets/sec from one IP with no ACK responses. The server exhausts its half-open connection table. Block at perimeter firewall immediately..'
      },
      {
        name:'FLOW-A2', purpose:'UDP traffic — DNS amplification vector',
        srcIP:'203.0.113.50', protocol:'UDP', dstPort:'53', rate:'8,400 pkts/sec', flags:'N/A',
        ragAnswer:'R', actionAnswer:'block',
        notes:'DNS amplification: 14-byte queries eliciting 3,800-byte responses — a 271× amplification factor. A botnet sends spoofed queries using the victim\'s IP as source; the DNS server unknowingly floods the victim..'
      },
      {
        name:'FLOW-A3', purpose:'TCP traffic — sequential port targeting',
        srcIP:'91.108.4.128', protocol:'TCP', dstPort:'1–1024 (sequential)', rate:'2,100 pkts/sec', flags:'SYN',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Sequential port scan: attacker probing ports 1–1024 looking for open services. This is reconnaissance before an attack. SYN-only packets to each port in sequence is the signature. Block source and log for threat intelligence.'
      },
      {
        name:'FLOW-A4', purpose:'ICMP flood from external source',
        srcIP:'198.51.100.42', protocol:'ICMP', dstPort:'N/A', rate:'32,000 pkts/sec', flags:'Echo Request (type 8)',
        ragAnswer:'R', actionAnswer:'block',
        notes:'ICMP flood (Ping flood): oversized 1,472-byte echo requests at 32,000/sec from one source. A volumetric DDoS attack designed to saturate bandwidth. ICMP at this rate has no legitimate justification.'
      },
      {
        name:'FLOW-A5', purpose:'TCP — many partial connections',
        srcIP:'5.188.206.14', protocol:'TCP', dstPort:'80', rate:'18,000 partial conns', flags:'SYN only (never completed)',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Slowloris-style attack: thousands of HTTP connections opened simultaneously, each never completed. This exhausts the web server\'s connection pool without flooding bandwidth. Low-and-slow but devastating to application servers.'
      },
      // AMBER — suspicious, needs investigation
      {
        name:'FLOW-B1', purpose:'SSH traffic from Tor exit node',
        srcIP:'185.220.101.5 (Tor exit)', protocol:'TCP', dstPort:'22', rate:'3 pkts/sec', flags:'SYN, ACK',
        ragAnswer:'A', actionAnswer:'monitor',
        notes:'Low-and-slow SSH authentication attempts from a known Tor exit node. Rate is deliberately low to evade rate-based detection. Source IP confirmed on multiple threat intelligence blocklists. Monitor for credential stuffing. SSH (port 22) is a high-value target.'
      },
      {
        name:'FLOW-B2', purpose:'HTTPS from unexpected geolocation',
        srcIP:'119.29.57.221 (CN)', protocol:'HTTPS', dstPort:'443', rate:'180 pkts/sec', flags:'SYN, ACK, PSH',
        ragAnswer:'A', actionAnswer:'monitor',
        notes:'Consistent HTTPS traffic from an IP geolocating to China. Rate is not alarming but is unusual — the company has no commercial presence in this region. May warrant geoblocking or closer inspection of exfiltrated payload volume. Monitor for data exfiltration patterns.'
      },
      {
        name:'FLOW-B3', purpose:'SMB traffic from internal workstation',
        srcIP:'10.0.14.52 (internal)', protocol:'TCP', dstPort:'445', rate:'850 conns/sec', flags:'SYN, ACK',
        ragAnswer:'A', actionAnswer:'monitor',
        notes:'Unusually high SMB (port 445) connection attempts originating from an internal host. Could indicate worm propagation or lateral movement following a compromise. The internal source makes this AMBER rather than RED — investigate the source host.'
      },
      // GREEN — normal, legitimate traffic
      {
        name:'FLOW-C1', purpose:'Standard HTTPS web traffic',
        srcIP:'147.161.30.5', protocol:'HTTPS', dstPort:'443', rate:'45 pkts/sec', flags:'SYN, ACK, PSH, FIN',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Normal HTTPS browsing traffic. Packet rate, size distribution (800–1500 bytes variable) and flag sequence are all consistent with a TLS session from a legitimate browser.'
      },
      {
        name:'FLOW-C2', purpose:'DNS resolution to public resolver',
        srcIP:'8.8.8.8', protocol:'UDP', dstPort:'53', rate:'12 pkts/sec', flags:'N/A',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Standard DNS resolution traffic to Google public DNS (8.8.8.8). Query/response sizes and rate are consistent with normal client-side domain lookups. No amplification pattern detected.'
      },
      {
        name:'FLOW-C3', purpose:'NTP time synchronisation',
        srcIP:'pool.ntp.org', protocol:'UDP', dstPort:'123', rate:'1 pkt/min', flags:'N/A',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'NTP (Network Time Protocol) clock synchronisation. Standard 48-byte packets at expected intervals of roughly once per minute. Normal operating system behaviour on all networked hosts.'
      },
      {
        name:'FLOW-C4', purpose:'SMTP relay from internal mail server',
        srcIP:'192.168.1.10 (mail.internal)', protocol:'TCP', dstPort:'25', rate:'8 pkts/sec', flags:'SYN, ACK',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Standard SMTP email delivery from the internal mail relay. Volume and pattern are consistent with normal business email activity during working hours. Source is a known internal mail server.'
      },
    ];
    // Adaptive difficulty — set by Analyst Pre-Brief diagnostic score
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION: mostly clear RED/GREEN, light AMBER
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED: more AMBER ambiguity, still varied
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD: balanced mix
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}  // always ≥1 GREEN
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  reportTeams:{ correct:'Network Security Operations Centre (NSOC)', incorrect:'Human Resources Department' },
  reportHint: 'Packet-level attacks require network-layer containment — which team owns the network perimeter?',

  completionText(_,sc){
    const att=sc.filter(s=>s.ragAnswer!=='G').length;
    const sev=sc.filter(s=>s.ragAnswer==='R').length;
    return `<div class="rc info">
      <div style="font-family:'Orbitron',monospace;font-size:11px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — NETWORK ANALYSIS</div>
      <p style="margin-bottom:8px;">You identified <strong>${sev} active threat(s)</strong> and ${att-sev} suspicious flow(s) in this capture window. ${sev>0?'These are consistent with the reconnaissance phase of the TechCorp breach — the attacker was mapping the network before moving to exploitation.':'No confirmed attacks in this window — but the suspicious flows warrant monitoring.'}</p>
      <hr style="border-color:rgba(0,255,65,.15);margin:10px 0;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: NETWORKS & SECURITY</div>
      <p style="font-size:12px;line-height:1.6;">Key concepts examiners test: <strong>TCP three-way handshake</strong> (SYN→SYN-ACK→ACK), <strong>SYN flood mechanics</strong> (half-open connections exhaust server), <strong>DNS amplification</strong> (small query → large response), <strong>packet vs circuit switching</strong>, <strong>role of firewalls and proxies</strong>. A 4-mark answer on SYN floods should cover: (1) mechanism, (2) why the server fails, (3) why it\'s hard to filter, (4) one countermeasure.</p>
    </div>`;
  },

  actions:{ R:'block', A:'monitor', G:'allow' },
  actionLabels:{ block:'🚫 BLOCK SOURCE', monitor:'👁 MONITOR & ALERT', allow:'✅ ALLOW FLOW' },
  ragRules:{
    R:'Clear attack signature: SYN flood / scan / amplification → BLOCK SOURCE',
    A:'Suspicious: unusual source, low-and-slow, unexpected geo → FLAG & MONITOR',
    G:'Normal traffic profile: expected protocol, rate, source → ALLOW',
  },

  plenary:{
    reportHint: 'Packet-level attacks require network-layer containment — which team owns the network perimeter?',
    analogy: 'Triaging packet captures is like reviewing airport security footage: most passengers are legitimate, but specific behavioural patterns — trying every gate, sending thousands of identical bags, or arriving from unusual routes — stand out once you know the signatures.',
    whatHappened: 'The network was being probed and attacked simultaneously: a volumetric SYN flood, a DNS amplification attack, and a reconnaissance port scan — all occurring against a backdrop of entirely normal traffic that required careful distinction.',
    keyMove: 'SYN only, no ACK, high rate = SYN flood (RED). Small request → huge response = amplification (RED). Sequential ports = scan (RED). Low-rate SSH from Tor exit node = suspicious (AMBER). Expected protocol, rate and source = allow (GREEN).',
    realWorld: 'The 2016 Mirai botnet attack on Dyn demonstrated that IoT devices with default credentials could generate record-breaking traffic. Understanding TCP flags, DNS amplification, and DDoS anatomy is essential for any network security analyst.',
    quiz:[
      {q:'A network captures thousands of connection requests per second from a single IP address. Each request starts the TCP handshake but none complete. What type of attack does this indicate?',options:['Normal high-volume web traffic from a content delivery network','A SYN flood — a form of DDoS where half-open connections exhaust the server\'s resources','A port scan identifying which services are running on the server'],correct:1},
      {q:'DNS primarily uses which transport protocol, and why?',options:['TCP — to guarantee reliable delivery of zone transfers and large queries','UDP — for low-overhead, fast queries where a lost packet just triggers a retry','HTTPS — to encrypt all DNS lookups from eavesdropping'],correct:1},
      {q:'In packet switching (unlike circuit switching), packets:',options:['Follow a single reserved end-to-end circuit for the session','May take different routes and are reassembled at the destination','Are broadcast to all nodes simultaneously on the network'],correct:1},
      {q:'A proxy server deployed in a corporate network can:',options:['Encrypt all files stored on the internal file server','Filter and log outbound web requests on behalf of internal clients, hiding their IPs','Replace the routing function of the default gateway'],correct:1},
      {q:'Which of the following is NOT a typical characteristic of a DDoS attack?',options:['Traffic originates from many distributed source IP addresses','The target service becomes unavailable to legitimate users','All attack traffic originates from a single source IP address'],correct:2},
      {q:'What is a distributed denial-of-service (DDoS) attack and how does it differ from a standard DoS attack?',options:['DDoS uses encryption to make the attack harder to detect; DoS sends unencrypted traffic','A DDoS attack uses traffic from many compromised devices simultaneously, making it harder to block than a DoS attack from a single source','DDoS targets application-layer vulnerabilities; DoS only targets network-layer infrastructure'],correct:1},
      {q:'UDP differs from TCP in that it:',options:['Guarantees reliable, ordered delivery via acknowledgement numbers','Is faster but provides no delivery guarantees, ordering or flow control','Requires a three-way handshake before any data transfer can begin'],correct:1},
      {q:'The TCP three-way handshake sequence is:',options:['ACK → SYN → SYN-ACK (client confirms, server accepts, client acknowledges)','SYN → SYN-ACK → ACK (client requests, server responds, client confirms)','SYN → ACK → FIN (connect, confirm, terminate)'],correct:1},
      {q:'An organisation wants to allow staff to access social media during lunch but block it during work hours. Which security control makes this possible?',options:['A network switch — which can be programmed to block traffic at specific times of day','A proxy server or firewall with content filtering rules — which can allow or block categories of website based on policies','An intrusion detection system — which monitors for unusual patterns of access and alerts the administrator'],correct:1},
    
      {q:'What distinguishes a DDoS attack from a DoS attack?',options:['A DDoS uses encrypted traffic to bypass firewalls; a DoS does not','A DoS attack comes from a single source; a DDoS uses many distributed sources — typically a botnet — making it harder to block by IP','A DDoS only targets DNS servers; a DoS can target any service'],correct:1},
      {q:'What is the purpose of a network switch in a local area network?',options:['To connect the local network to the internet and route traffic to the correct destination','To receive data frames and forward them only to the device they are addressed to, using MAC addresses','To translate between private internal IP addresses and the public IP address used on the internet'],correct:1},
      {q:'What is the role of the Internet layer in the TCP/IP model?',options:['To define the physical transmission of data between directly connected devices on the same network','To handle IP addressing and the routing of data packets between different networks','To manage reliable end-to-end communication and error checking between applications'],correct:1},
      {q:'Why is packet switching preferred over circuit switching for internet communication?',options:['Circuit switching cannot handle video or audio data at all','Packet switching shares network capacity efficiently — packets from many sources share links rather than each requiring a dedicated connection','Packet switching is faster because packets travel in a straight line without routing'],correct:1},
      {q:'In the TCP/IP model, which layer is responsible for end-to-end error checking and flow control?',options:['Network layer — handles IP addressing and routing','Transport layer — TCP provides reliability, ordering and flow control','Application layer — handles protocols such as HTTP and DNS'],correct:1},
      {q:'Why is UDP preferred over TCP for real-time streaming applications?',options:['UDP provides guaranteed delivery, making video frames more reliable','UDP has lower overhead — no connection setup or acknowledgements, so latency is lower even if some packets are lost','UDP automatically encrypts data in transit, protecting the stream from interception'],correct:1},
    ]
  }
};


// ═══════════════════════════════════════════════════════════
// MODULE 2: ENCRYPTION CONFIGURATION AUDIT
// H446 §1.3.1 — Symmetric & asymmetric encryption, hashing
// ═══════════════════════════════════════════════════════════
MODULES.encryptionAudit = {
  id: 'encryptionAudit',
  name: 'ENCRYPTION CONFIGURATION AUDIT',

  emailSender: ()=>pick(['crypto@secops.internal','key-mgmt@infrasec.net','audit@cryptoteam.io','ciso-office@company.net']),
  emailSubject: ()=>pick(['Cryptographic Audit: Immediate Action Required','Quarterly Encryption Review — Critical Findings','CISO Request: Encryption Health Check','Cryptography Audit Report — Analyst Review Needed']),
  emailBody(){
    return 'Analyst,\n\nTechCorp Global processes payments for 500,000 UK customers. '
      +'With a confirmed breach, we need to assess what cryptographic protections were in place — '
      +'and whether any inadequacy contributed to the exposure.\n\n'
      +'The results will determine our ICO notification obligations. '
      +'If customer passwords were stored with broken hashing, or payment data encrypted with deprecated ciphers, '
      +'that materially changes the severity of our disclosure.\n\n'
      +'Load the Encryption Audit Tool and classify each configuration.\n\n'
      +'CISO Support — TechCorp IR';
  },
  diagnosticSummary:'Encryption transforms data using a key. Symmetric uses one shared key such as AES. Asymmetric uses a public and private key pair such as RSA. Hashing produces a fixed-length one-way digest. MD5 and SHA-1 have known weaknesses. bcrypt is designed for password storage because it is deliberately slow. Key length in bits determines resistance to brute-force attacks.',
  diagnosticQuestions:[
    {q:'What does encryption do',opts:['Makes data unreadable to anyone without the correct key','Checks data for errors before it is stored','Compresses data to reduce its size for storage'],ok:0,hint:'Encryption provides confidentiality — only key holders can decrypt and read the data.'},
    {q:'What makes a hash function one-way',opts:['A hash can only be calculated once per input','The original input cannot be derived from the hash','Hashes are reversed using an encrypted lookup table'],ok:1,hint:'You can verify by hashing again and comparing — but you cannot reverse a hash.'},
    {q:'What is symmetric encryption',opts:['One key is public and the other is kept private','It produces a fixed-length output from any input','Both parties use the same key to encrypt and decrypt'],ok:2,hint:'Symmetric encryption like AES is fast for bulk data. The challenge is sharing the key securely.'},
    {q:'AES stands for',opts:['Advanced Encryption Standard','Automated Encryption Standard','Asymmetric Encryption System'],ok:0,hint:'AES (Advanced Encryption Standard) is the current symmetric encryption standard.'},
    {q:'What is a private key in asymmetric encryption',opts:['A key shared privately with all authorised recipients','A secret key only its owner holds, used to decrypt','The master key that generates all session keys'],ok:1,hint:'Anyone can encrypt with the public key — only the private key holder can decrypt.'},
    {q:'RSA is an example of',opts:['A hashing algorithm producing a fixed-length output','A symmetric algorithm using a shared secret key','An asymmetric algorithm using public and private keys'],ok:2,hint:'RSA uses mathematically linked key pairs — used for key exchange and digital signatures.'},
    {q:'A hash function always produces',opts:['A fixed-length output regardless of input size','Output proportional in length to the input size','Output that can be reversed with the original key'],ok:0,hint:'SHA-256 always outputs 256 bits whether input is 1 character or 1 gigabyte.'},
    {q:'Why is it important to use a strong hashing algorithm for storing passwords',opts:['Weak algorithms store passwords in plain text making them easy to steal','Weak hashing algorithms can be reversed or matched quickly making stored passwords vulnerable','Strong algorithms compress passwords so they take up less database space'],ok:1,hint:'If an attacker steals a database, they want to recover the original passwords from the hashes — a strong algorithm makes this very difficult.'},
,
    {q:'What is a salt added to passwords before hashing',opts:['A secondary encryption layer applied to the hash','A minimum length requirement for the password','A random value ensuring identical passwords hash differently'],ok:2,hint:'Without salts, identical passwords produce identical hashes — trivially reversible.'},
    {q:'Why is MD5 unsuitable for storing passwords',opts:['MD5 is too fast to compute, making brute force easy','MD5 is an asymmetric algorithm requiring two keys','MD5 produces hashes that are too short to be safe'],ok:0,hint:'Password hashing for passwords needs to be deliberately slow to resist automated attacks — purpose-built password hashing functions provide this.'},
    {q:'What is ciphertext',opts:['Text that has been validated as safe to store','Data that has been encrypted and is unreadable without the key','Compressed data formatted for secure transmission'],ok:1,hint:'Plaintext is original data. Ciphertext is the result of encryption. Decryption reverses it.'},
    {q:'What is end-to-end encryption',opts:['Encryption applied only at the sender\'s device','Encryption covering only the last network hop','Data encrypted so only sender and recipient can read it'],ok:2,hint:'Even the service provider cannot read messages — only sender and recipient hold the keys.'},
    {q:'What does a Certificate Authority do',opts:['Verifies and signs public keys to establish trust','Encrypts all traffic between a client and server','Generates a session key for each HTTPS connection'],ok:0,hint:'CAs are the trust anchors of HTTPS. Your browser trusts a site because its cert is CA-signed.'},
    {q:'Key length in encryption refers to',opts:['The length of the password used to unlock the key','The number of bits in a key — more bits means harder to brute force','The time taken to generate or apply a key'],ok:1,hint:'Doubling key length squares the possible key space. AES-256 has 2 to the power of 256 possibilities.'},
    {q:'What is the difference between a public key and a private key in asymmetric encryption',opts:['The public key is longer; the private key is shorter','The public key can be shared with anyone; the private key must never be shared — it is used to decrypt what the public key encrypted','The public key is used for encryption in symmetric systems; the private key is used in asymmetric ones'],ok:1,hint:'The security of asymmetric encryption depends entirely on keeping the private key secret — the public key is designed to be shared freely.'},
,
    {q:'Main advantage of asymmetric over symmetric encryption',opts:['The public key can be shared freely — no secure channel needed','It is much faster when encrypting large amounts of data','It produces shorter ciphertext saving bandwidth and storage'],ok:0,hint:'The key distribution problem: how do you share a symmetric key? Asymmetric encryption solves this.'},
    {q:'Encrypting data at rest means',opts:['Encrypting data only while it travels the network','Encrypting data stored on disk rather than in transit','Archiving old data before it is securely deleted'],ok:1,hint:'Both at rest and in transit are threat surfaces. Full-disk encryption protects against device theft.'},
    {q:'What does a digital signature prove about a message',opts:['That the message was encrypted and cannot be read by anyone else','That the message was sent by the claimed sender and has not been altered since it was signed','That the message was sent over a secure HTTPS connection'],ok:1,hint:'Digital signatures use asymmetric encryption — the sender signs with their private key, and anyone can verify with the public key.'},
,
    {q:'What is the main advantage of asymmetric encryption over symmetric',opts:['Asymmetric encryption is much faster and uses less processing power','The public key can be shared openly — only the recipient\'s private key can decrypt the message, so there is no need to share a secret key in advance','Asymmetric encryption produces shorter ciphertext than symmetric encryption'],ok:1,hint:'Symmetric encryption requires both parties to already have the same secret key — distributing that key securely is the challenge that asymmetric encryption solves.'},
    {q:'What is the difference between symmetric and asymmetric encryption',opts:['Symmetric uses two keys and asymmetric uses one','Symmetric uses the same key for encryption and decryption; asymmetric uses a mathematically linked key pair — one to encrypt, one to decrypt','Symmetric is used for data at rest and asymmetric is only used for email'],ok:1,hint:'AES is a symmetric algorithm — fast and used for bulk data. RSA is asymmetric — used for key exchange and digital signatures.'},

  ],
  tools: {
    correct: 'Encryption Audit Tool',
    decoys: ['Packet Capture Analyser','SQL Query Log Viewer','Firewall Rule Manager','Legal Reference Database','Network Traffic Monitor','Process Monitor','Certificate Transparency Log']
  },

  briefing: {
    title: 'Encryption Configuration Audit',
    tagline: 'Assessing cryptographic algorithm strength across all company systems',
    summary: 'Encryption protects data in transit and at rest. Symmetric algorithms (AES, DES) use one shared key for both encryption and decryption. Asymmetric algorithms (RSA) use mathematically linked public/private key pairs — encrypt with the recipient\'s public key, decrypt with their private key. Hashing (SHA-256, MD5) is a one-way process producing a fixed-length digest — it cannot be reversed. As computing power increases, previously secure algorithms become vulnerable and must be replaced.',
    watchFor: 'DES-56 (56-bit key, broken — replace immediately) • MD5 or SHA-1 for password hashing (vulnerable to rainbow tables) • RC4 stream cipher (statistical biases, deprecated) • RSA keys below 2048 bits • Any cipher marked DEPRECATED by NIST or NCSC • AES used for password storage (wrong use case — should use bcrypt or Argon2)',
    realWorld: 'In 2012 LinkedIn suffered a breach in which 6.5 million password hashes were posted online. LinkedIn was using unsalted SHA-1 — a fast cryptographic hash with no salt. Attackers cracked the majority of passwords within days using precomputed rainbow tables. By 2016, a full 117 million records from the same breach were being sold. The fix: use bcrypt, scrypt or Argon2 — algorithms designed to be slow and resist precomputation.'
  },

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — cryptographically broken, replace immediately
      {
        name:'db-auth-service', purpose:'DES-56 | User authentication database',
        algorithm:'DES', keySize:'56 bits', useCase:'Data at rest (authentication DB)', lastUpdated:'2009',
        ragAnswer:'R', actionAnswer:'replace',
        notes:'DES (Data Encryption Standard) with a 56-bit key is cryptographically broken. Exhaustive key-search attacks are feasible on commodity hardware. Replace with AES-256-GCM immediately..'
      },
      {
        name:'user-passwords-v1', purpose:'MD5 (unsalted) | Password hash store',
        algorithm:'MD5', keySize:'128-bit output', useCase:'Password storage (unsalted)', lastUpdated:'2011',
        ragAnswer:'R', actionAnswer:'replace',
        notes:'MD5 is a fast hash with known collision vulnerabilities. Used unsalted for passwords, it is trivially defeated by rainbow table attacks. Replace with bcrypt (work factor ≥12) or Argon2id immediately..'
      },
      {
        name:'legacy-vpn-stream', purpose:'RC4 | VPN session encryption',
        algorithm:'RC4', keySize:'128 bits', useCase:'VPN traffic encryption (in transit)', lastUpdated:'2013',
        ragAnswer:'R', actionAnswer:'replace',
        notes:'RC4 stream cipher has been prohibited by IETF (RFC 7465) since 2015 due to statistical biases in its keystream. Forbidden in TLS. Replace with AES-256-GCM or ChaCha20-Poly1305..'
      },
      {
        name:'api-key-exchange', purpose:'RSA-512 | API key exchange',
        algorithm:'RSA', keySize:'512 bits', useCase:'Asymmetric key exchange', lastUpdated:'2007',
        ragAnswer:'R', actionAnswer:'replace',
        notes:'RSA-512 can be factored in hours on standard hardware. NIST minimum is RSA-2048. This key exchange provides no meaningful security — replace with RSA-2048 or ECDH immediately..'
      },
      // AMBER — weakening, schedule replacement
      {
        name:'cert-signing-internal', purpose:'SHA-1 | Internal certificate signing',
        algorithm:'SHA-1', keySize:'160-bit output', useCase:'Digital signatures (certificates)', lastUpdated:'2016',
        ragAnswer:'A', actionAnswer:'schedule',
        notes:'SHA-1 was deprecated by NIST in 2011 and browsers began refusing SHA-1 certificates from 2017. Collision attacks are now practical (SHAttered, 2017). Not immediately broken but schedule migration to SHA-256..'
      },
      {
        name:'backup-encrypt-legacy', purpose:'3DES-112 | Backup file encryption',
        algorithm:'3DES (Triple-DES)', keySize:'112 bits effective', useCase:'Data at rest (backups)', lastUpdated:'2014',
        ragAnswer:'A', actionAnswer:'schedule',
        notes:'3DES has an effective key length of 112 bits due to the meet-in-the-middle attack. NIST deprecated it in 2017 and disallows it from 2024. Still offers some security but schedule migration to AES-256..'
      },
      {
        name:'file-store-aes128', purpose:'AES-128-CBC | Document store encryption',
        algorithm:'AES-128-CBC', keySize:'128 bits', useCase:'Data at rest (document storage)', lastUpdated:'2019',
        ragAnswer:'A', actionAnswer:'schedule',
        notes:'AES-128 is technically sound but CBC mode has padding oracle vulnerabilities. NIST now recommends AES-256-GCM (authenticated encryption). Not urgent but schedule upgrade during next maintenance window..'
      },
      {
        name:'rsa-1024-signing', purpose:'RSA-1024 | Legacy document signing',
        algorithm:'RSA', keySize:'1024 bits', useCase:'Digital signatures (documents)', lastUpdated:'2015',
        ragAnswer:'A', actionAnswer:'schedule',
        notes:'RSA-1024 is below NIST\'s recommended minimum of 2048 bits. While not immediately vulnerable, factoring attacks are advancing. Schedule migration to RSA-2048 or ECDSA-256..'
      },
      // GREEN — current best practice, maintain
      {
        name:'db-encrypt-primary', purpose:'AES-256-GCM | Primary database encryption',
        algorithm:'AES-256-GCM', keySize:'256 bits', useCase:'Data at rest (primary database)', lastUpdated:'2022',
        ragAnswer:'G', actionAnswer:'maintain',
        notes:'AES-256-GCM is the current gold standard for symmetric encryption. GCM mode provides both confidentiality and integrity (authenticated encryption). No action required..'
      },
      {
        name:'tls-key-exchange', purpose:'RSA-2048 | TLS key exchange',
        algorithm:'RSA', keySize:'2048 bits', useCase:'Asymmetric key exchange (TLS)', lastUpdated:'2021',
        ragAnswer:'G', actionAnswer:'maintain',
        notes:'RSA-2048 meets NIST\'s current minimum recommendation. Appropriate for TLS key exchange. Review in 2030 when RSA-3072 will be recommended. No immediate action required..'
      },
      {
        name:'user-passwords-v2', purpose:'bcrypt (work factor 12) | Password store',
        algorithm:'bcrypt', keySize:'192-bit output + salt', useCase:'Password storage', lastUpdated:'2022',
        ragAnswer:'G', actionAnswer:'maintain',
        notes:'bcrypt is a password-hashing function designed to be computationally slow and salted. Work factor 12 is appropriate for current hardware. Correct tool for password storage — not a general-purpose hash..'
      },
      {
        name:'file-integrity-check', purpose:'SHA-256 | File integrity verification',
        algorithm:'SHA-256', keySize:'256-bit output', useCase:'Integrity verification (checksums)', lastUpdated:'2023',
        ragAnswer:'G', actionAnswer:'maintain',
        notes:'SHA-256 is the current standard for integrity verification. Part of the SHA-2 family, it has no known practical attacks. Correct use case — verifying file integrity, not password storage. No action required..'
      },
    ];
    // Adaptive difficulty — set by Analyst Pre-Brief diagnostic score
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION: mostly clear RED/GREEN, light AMBER
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED: more AMBER ambiguity, still varied
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD: balanced mix
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}  // always ≥1 GREEN
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  reportTeams:{ correct:'Cryptography & Key Management Team', incorrect:'Facilities Management' },
  reportHint: 'Cryptographic vulnerabilities require specialist remediation — which team manages keys and cipher selection?',

  completionText(_,sc){
    const crit=sc.filter(s=>s.ragAnswer==='R').length;
    const weak=sc.filter(s=>s.ragAnswer==='A').length;
    return `<div class="rc info">
      <div style="font-family:'Orbitron',monospace;font-size:11px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — ENCRYPTION AUDIT</div>
      <p style="margin-bottom:8px;"><strong>${crit} critical finding(s)</strong> and ${weak} scheduled replacement(s). ${crit>0?'These configurations represent real exposure — if customer payment data or passwords were protected by the broken algorithms you identified, the breach severity is significantly higher.':'TechCorp\'s cryptographic posture is better than average — the weakening algorithms identified should still be scheduled for replacement.'}</p>
      <hr style="border-color:rgba(0,255,65,.15);margin:10px 0;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: ENCRYPTION & HASHING</div>
      <p style="font-size:12px;line-height:1.6;">Examiners test: <strong>symmetric vs asymmetric</strong> (one key vs key pair — know when each is used), <strong>hashing is one-way</strong> (cannot decrypt), <strong>why fast hashes fail for passwords</strong> (rainbow tables), <strong>purpose of salting</strong>. Classic 4-mark question: "Explain why MD5 is not suitable for storing passwords" — model answer covers: (1) fast to compute, (2) enables precomputed rainbow table attacks, (3) no salt = identical passwords produce identical hashes, (4) better alternatives exist (bcrypt, Argon2).</p>
    </div>`;
  },

  actions:{ R:'replace', A:'schedule', G:'maintain' },
  actionLabels:{ replace:'🔴 REPLACE URGENTLY', schedule:'🟡 SCHEDULE REPLACEMENT', maintain:'✅ MAINTAIN' },
  ragRules:{
    R:'Cryptographically broken: DES, MD5/SHA-1 for passwords, RC4, RSA<1024 → REPLACE URGENTLY',
    A:'Weakening: SHA-1 for certs, 3DES, AES-128-CBC, RSA-1024 → SCHEDULE REPLACEMENT',
    G:'Current best practice: AES-256-GCM, RSA-2048+, bcrypt, SHA-256 → MAINTAIN',
  },

  plenary:{
    reportHint: 'Cryptographic vulnerabilities require specialist remediation — which team manages keys and cipher selection?',
    analogy: 'Auditing encryption configurations is like inspecting a building\'s locks: some are strong deadbolts (AES-256), some are old padlocks that were once fine but are now pickable (3DES, SHA-1), and some were never secure to begin with (DES-56, MD5 for passwords). Each needs a different response.',
    whatHappened: 'The audit revealed a mix of critically broken algorithms (DES, MD5, RC4) still in active use, legacy systems that need scheduled migration (3DES, SHA-1, RSA-1024), and correctly configured modern cryptography. The critical findings represent immediate risk to data confidentiality.',
    keyMove: 'Symmetric encryption uses one shared key (AES = current standard; DES = broken). Asymmetric uses public/private pairs (RSA-2048 = minimum; RSA-512 = replace now). Hashing is one-way — use SHA-256 for integrity, bcrypt/Argon2 for passwords (NOT MD5 or SHA-1).',
    realWorld: 'LinkedIn\'s 2012 breach demonstrated exactly what happens when fast, unsalted hashes protect passwords: 117 million accounts were compromised because SHA-1 without salt can be attacked with rainbow tables. The distinction between encryption (reversible) and hashing (one-way) — and choosing the right algorithm for the job — is precisely why password stores still get breached.',
    quiz:[
      {q:'Which of the following correctly describes symmetric encryption?',options:['Uses a public key to encrypt and a separate private key to decrypt','Uses the same key for both encryption and decryption','Produces a fixed-length output from which the original data cannot be derived'],correct:1},
      {q:'To send a confidential message to Alice using asymmetric encryption, you would encrypt it with:',options:['Your own private key — proving you sent it','Alice\'s private key — giving her exclusive access','Alice\'s public key — only her private key can then decrypt it'],correct:2},
      {q:'Which of the following is a hashing algorithm rather than an encryption algorithm?',options:['AES-256 (used for encrypting files)','RSA-2048 (used for key exchange)','SHA-256 (used for integrity checking)'],correct:2},
      {q:'A hash function is described as "one-way". This means:',options:['It can only be applied once per document — not reversible by further hashing','The original data cannot be mathematically derived from the hash value alone','It only works in one direction: from server to client'],correct:1},
      {q:'MD5 is no longer considered safe for password storage primarily because:',options:['It produces digests that are too short to be unique across all possible inputs','It is a symmetric cipher and requires secure key distribution between parties','It is too fast to compute — pre-computed hash lists can crack MD5 passwords quickly, and its collision vulnerabilities make it unreliable for security'],correct:2},
      {q:'A digital signature is created using:',options:['The sender\'s private key — allowing anyone with the public key to verify authenticity','The recipient\'s public key — ensuring only the recipient can read the message','A shared symmetric key — agreed in advance using secure key exchange'],correct:0},
      {q:'AES-256 used to encrypt a backup file is an example of:',options:['Asymmetric encryption — using a public/private key pair','Hashing — producing a one-way digest of the file contents','Symmetric encryption — using a single shared key for both encryption and decryption'],correct:2},
      {q:'Why is asymmetric encryption typically used for key exchange rather than bulk data encryption?',options:['It cannot process data larger than the key size in bits','Asymmetric encryption is far more computationally demanding than symmetric encryption than symmetric ciphers','Both parties must be online simultaneously for asymmetric encryption to function'],correct:1},
      {q:'A "salt" added to a password before hashing prevents:',options:['The hash from being stored in plaintext in the database','Two identical passwords producing identical hash values — a unique salt per password means identical passwords produce different hashes, preventing bulk crackingble attacks','The password from being transmitted over the network in plaintext'],correct:1},
    
      {q:'What is a digital certificate and who issues it?',options:['A document proving a device meets minimum security standards, issued by the device manufacturer','An electronic document that links a public key to the identity of its owner, issued by a trusted Certificate Authority','A password generated by the operating system and stored securely in a hardware chip on the device'],correct:1},
      {q:'What is the purpose of a digital certificate issued by a Certificate Authority?',options:['To encrypt the content of web pages so they cannot be intercepted','To verify that a public key genuinely belongs to the organisation it claims to represent','To store the private key securely on a web server'],correct:1},
      {q:'What is the difference between encryption and hashing?',options:['Encryption and hashing are the same process — both produce output that cannot be reversed','Encryption is reversible using the correct key; hashing is one-way — the original data cannot be recovered from the hash output','Hashing is used for confidentiality; encryption is used for verifying file integrity'],correct:1},
      {q:'What is a hash collision, and why does it matter for security?',options:['When two encryption keys are identical — breaks the confidentiality of the cipher','When two different inputs produce the same hash output — an attacker could substitute a malicious file without detection','When a hash function takes too long to compute — causing denial of service'],correct:1},
      {q:'Why should user passwords be stored as hashes rather than in plain text?',options:['Hashing compresses the password to save storage space in the database','If the database is breached, attackers cannot recover the original passwords from the stored hashes','Hashing encrypts the password so that only the database administrator can read it'],correct:1},
      {q:'A file has been downloaded from the internet. Which technology would allow the recipient to verify the file has not been tampered with in transit?',options:['Symmetric encryption — encrypting the file with a shared key before sending','Hashing — comparing a hash of the received file against the hash published by the sender','Asymmetric encryption — encrypting the file with the sender\'s private key'],correct:1},
    ]
  }
};


// ═══════════════════════════════════════════════════════════
// MODULE 3: SQL INJECTION DETECTION
// H446 §1.3.2 — Databases, SQL, normalisation, transactions
// ═══════════════════════════════════════════════════════════
MODULES.sqlInjection = {
  id: 'sqlInjection',
  name: 'SQL INJECTION DETECTION',

  emailSender: ()=>pick(['waf@secops.internal','appsec@infrasec.net','dba@database-ops.io','appsec-alerts@company.net']),
  emailSubject: ()=>pick(['WAF Alert: Potential SQL Injection Attempts Detected','Application Security Alert: Suspicious Database Queries','DBA Notice: Anomalous Input Detected in Application Logs','AppSec P2 Alert: SQL Metacharacters in Form Submissions']),
  emailBody(){
    return 'Analyst,\n\nTechCorp\'s WAF flagged unusual submissions against their payment portal '
      +'in the hours before the breach was confirmed. '
      +'SQL injection against a payment application is a serious initial access vector.\n\n'
      +'If any of these payloads succeeded, it may be how the attacker got in. '
      +'Evidence of exploitation will be critical for both the technical remediation and the legal investigation — '
      +'particularly if customer payment data was accessed.\n\n'
      +'Load the SQL Query Log Viewer and triage each entry.\n\n'
      +'Application Security Lead — TechCorp IR';
  },
  diagnosticSummary:'Relational databases store data in tables with rows and columns. SQL queries retrieve and modify data. SELECT retrieves rows. WHERE filters them. INSERT INTO adds rows. UPDATE modifies rows. DELETE FROM removes rows. DROP TABLE removes the entire table. Primary keys uniquely identify rows. Foreign keys link tables. Parameterised queries separate SQL code from user input preventing injection.',
  diagnosticQuestions:[
    {q:'What does SQL stand for',opts:['Structured Query Language','System Query Library','Secure Query Logic'],ok:0,hint:'SQL is the standard language for relational databases — MySQL, PostgreSQL, SQL Server all use it.'},
    {q:'What is a relational database',opts:['A database stored and replicated in the cloud','A database structured as linked tables with rows and columns','A database that connects computers across a network'],ok:1,hint:'Relational refers to tables linked by relationships defined through keys.'},
    {q:'What does SELECT * FROM users do',opts:['Creates a new copy of the users table','Deletes all rows from the users table','Retrieves all rows and columns from the users table'],ok:2,hint:'SELECT retrieves data. Asterisk means all columns. Without WHERE all rows are returned.'},
    {q:'What is a primary key in a database',opts:['A unique identifier for each row in a table','The most important data field in the table','The password used to access the database'],ok:0,hint:'Primary keys enforce uniqueness and serve as the reference point for foreign keys.'},
    {q:'What does the WHERE clause do in SQL',opts:['Specifies the server where data should be stored','Filters rows based on a specified condition','Combines results from multiple tables into one'],ok:1,hint:'WHERE is the filtering mechanism — SQL injection often manipulates WHERE to bypass authentication.'},
    {q:'What is a foreign key',opts:['An encrypted key protecting sensitive columns','A key imported from an external database','A field referencing the primary key of another table'],ok:2,hint:'Foreign keys enforce referential integrity — you can\'t reference a row that doesn\'t exist elsewhere.'},
    {q:'What does DELETE FROM do',opts:['Removes rows matching a condition keeping the table intact','Removes the entire table and all its structure','Removes specific columns from the table permanently'],ok:0,hint:'DELETE without WHERE removes all rows but keeps the table. DROP TABLE removes the table itself.'},
    {q:'DROP TABLE removes',opts:['Rows matching a given condition from the table','The entire table and all its data permanently','The table structure while preserving data elsewhere'],ok:1,hint:'DROP TABLE is irreversible without a backup — SQL injection achieving this destroys a dataset.'},
    {q:'What is referential integrity',opts:['All data in the database is encrypted at rest','Every database table must have exactly one primary key','Foreign key values must match valid primary keys elsewhere'],ok:2,hint:'Referential integrity prevents orphaned records — an order cannot reference a non-existent customer.'},
    {q:'What does UNION do in SQL',opts:['Combines results of two SELECT queries into one result set','Permanently merges two separate databases into one','Connects the application to a remote database server'],ok:0,hint:'SQL injection uses UNION SELECT to append attacker-controlled queries and exfiltrate data.'},
    {q:'What is database normalisation',opts:['Converting all values to a consistent standard format','Organising data to reduce redundancy, storing each fact once','Compressing database tables to reduce storage footprint'],ok:1,hint:'Normalisation removes duplicate data. 1NF, 2NF, 3NF are the standard levels.'},
    {q:'What does a database transaction ensure',opts:['Only authenticated users can modify records','Each query runs within a maximum time limit','A sequence of operations either all completes or none does'],ok:2,hint:'ACID transactions prevent partial updates — a failed bank transfer rolls back entirely.'},
    {q:'What does ACID stand for',opts:['Atomicity Consistency Isolation Durability','Access Control Integrity Durability','Availability Confidentiality Integrity Distribution'],ok:0,hint:'Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent safety), Durability (persists).'},
    {q:'What is a database transaction',opts:['A report generated from a database for financial auditing purposes','A sequence of operations treated as a single unit — either all complete successfully or none are applied','A scheduled backup of the entire database to an off-site location'],ok:1,hint:'Transactions protect data integrity — if one part fails, the whole operation is rolled back. This is key to ACID properties.'},
,
    {q:'What does INSERT INTO do',opts:['Creates a new database table with columns specified','Updates existing rows that match a given condition','Adds a new row of data to an existing table'],ok:2,hint:'SQL injection can use INSERT to create unauthorised accounts or records.'},
    {q:'What is an entity in ER modelling',opts:['A real-world object stored as a table in the database','A type of database error that needs resolving','A link between two networked database servers'],ok:0,hint:'Entities become tables — Customer, Order, Product. Attributes become columns.'},
    {q:'What is the purpose of data validation',opts:['Encrypting data before it is written to disk','Ensuring data meets required constraints before being stored','Verifying the database server is running correctly'],ok:1,hint:'Validation is a first defence but parameterised queries are still required separately.'},
    {q:'What does UPDATE do',opts:['Upgrades the database software to a newer version','Restores a table from the most recent backup','Modifies data in existing rows based on a condition'],ok:2,hint:'UPDATE without WHERE modifies every row — a classic accidental data destruction scenario.'},
    {q:'What is the difference between a primary key and a foreign key',opts:['A primary key encrypts data; a foreign key decrypts it','A primary key uniquely identifies each record in a table; a foreign key in one table references the primary key of another, linking the two tables','A primary key is created automatically; a foreign key must be defined manually'],ok:1,hint:'Foreign keys enforce referential integrity — they ensure a record in one table can only reference a record that actually exists in another.'},
,
    {q:'What makes a query vulnerable to SQL injection',opts:['The query retrieves data using the SELECT command','User input is directly embedded in the query string','The database is hosted on a publicly accessible server'],ok:1,hint:'When input is embedded in SQL code, attackers modify query structure. Parameterised queries prevent this.'}
  ],
  tools: {
    correct: 'SQL Query Log Viewer',
    decoys: ['Packet Capture Analyser','Encryption Audit Tool','Firewall Rule Manager','Legal Reference Database','Network Traffic Monitor','Process Monitor','Email Header Analyser']
  },

  briefing: {q:'Why is it important for web applications to validate and sanitise all user input before using it in a database query?',options:['Validation improves the speed of queries by reducing the amount of data processed','Unvalidated input can be crafted by an attacker to change the structure of a SQL query, accessing or destroying data they should not be able to reach','Validation ensures data is stored in the correct format, preventing crashes when the database is queried'],correct:1},

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — clear SQL injection attacks
      {
        name:'/api/v1/auth/login', purpose:'POST — user authentication endpoint',
        endpoint:'/api/v1/auth/login', inputField:'username', submittedValue:"' OR '1'='1' --",
        responseCode:'200 OK', rate:'1 req',
        ragAnswer:'R', actionAnswer:'block',
        notes:"Classic authentication bypass: the injected payload makes the WHERE clause evaluate to TRUE for every row, returning the first user (often admin). The -- comment discards the rest of the query. This is a textbook SQL injection. Block and alert the DBA."
      },
      {
        name:'/search', purpose:'GET — product search endpoint',
        endpoint:'/search', inputField:'q', submittedValue:"1; DROP TABLE orders; --",
        responseCode:'500 Internal Server Error', rate:'1 req',
        ragAnswer:'R', actionAnswer:'block',
        notes:"Destructive query chaining: a semicolon terminates the SELECT and begins a new DROP TABLE statement — permanently deleting the orders table and all its data. The 500 error may indicate the payload partially executed. Block and escalate to DBA immediately."
      },
      {
        name:'/api/v2/products', purpose:'GET — product listing with ID filter',
        endpoint:'/api/v2/products', inputField:'id', submittedValue:"1 UNION SELECT username, pwd_hash FROM users --",
        responseCode:'200 OK', rate:'3 reqs',
        ragAnswer:'R', actionAnswer:'block',
        notes:"UNION-based data exfiltration: the UNION SELECT appends a second query, returning rows from the users table alongside the product results. The attacker is enumerating password hashes and emails. Block source IP and rotate database credentials immediately."
      },
      {q:'Why is it important for web applications to validate and sanitise all user input before including it in database queries?',options:['Validation improves query speed by reducing the amount of data processed','Unvalidated input can be crafted to change the structure of the SQL query — allowing an attacker to access or destroy data they are not authorised to reach','Validation ensures names and addresses are stored in a consistent format, preventing errors in customer records'],correct:1},
      {
        name:'/api/v1/user/profile', purpose:'GET — user profile lookup by ID',
        endpoint:'/api/v1/user/profile', inputField:'user_id', submittedValue:"admin' --",
        responseCode:'200 OK', rate:'1 req',
        ragAnswer:'R', actionAnswer:'block',
        notes:"Authentication bypass using comment injection: appending -- after 'admin' comments out any password check in the query (e.g. WHERE username='admin'--' AND password=...). If the application returned a valid profile, the database is vulnerable."
      },
      // AMBER — suspicious, requires review
      {
        name:'/forms/contact', purpose:'POST — contact form submission',
        endpoint:'/forms/contact', inputField:'name', submittedValue:"Robert'); DROP TABLE students; --",
        responseCode:'400 Bad Request', rate:'1 req',
        ragAnswer:'A', actionAnswer:'investigate',
        notes:"This is the famous 'Little Bobby Tables' payload (XKCD 327). The 400 response suggests the WAF or input validation caught it — but it indicates someone tested an injection vector. Investigate source IP for further probing activity."
      },
      {
        name:'/api/v3/search', purpose:'GET — customer search endpoint',
        endpoint:'/api/v3/search', inputField:'query', submittedValue:"dXNlcm5hbWUgT1IgMT0x (base64)",
        responseCode:'200 OK', rate:'12 reqs',
        ragAnswer:'A', actionAnswer:'investigate',
        notes:"Base64-encoded payload: decodes to 'username OR 1=1'. Multiple requests (12) suggest automated scanning. The attacker is testing whether the application decodes user input before passing it to the database — an obfuscation attempt. Investigate and review WAF decode rules."
      },
      {
        name:'/api/v1/register', purpose:'POST — new account registration',
        endpoint:'/api/v1/register', inputField:'email', submittedValue:"test@test.com' AND '1",
        responseCode:'422 Unprocessable Entity', rate:'1 req',
        ragAnswer:'A', actionAnswer:'investigate',
        notes:"Potential blind SQL injection probe: the trailing ' AND '1 is testing whether the application processes the quote without sanitisation. The 422 response suggests validation exists, but the input pattern warrants investigation to confirm the endpoint is parameterised."
      },
      // GREEN — legitimate form submissions
      {
        name:'/api/v1/auth/login', purpose:'POST — user authentication endpoint',
        endpoint:'/api/v1/auth/login', inputField:'username', submittedValue:"alice.smith@company.com",
        responseCode:'200 OK', rate:'1 req',
        ragAnswer:'G', actionAnswer:'allow',
        notes:"Normal login submission. Email address format, no SQL metacharacters, rate of one request. No indicators of injection. Allow."
      },
      {
        name:'/search', purpose:'GET — product search endpoint',
        endpoint:'/search', inputField:'q', submittedValue:"blue wireless headphones",
        responseCode:'200 OK', rate:'4 reqs',
        ragAnswer:'G', actionAnswer:'allow',
        notes:"Normal search query. Natural language text, no SQL keywords or metacharacters. Four requests in the session is consistent with a user refining their search. Allow."
      },
      {
        name:'/forms/contact', purpose:'POST — contact form submission',
        endpoint:'/forms/contact', inputField:'name', submittedValue:"O'Brien",
        responseCode:'200 OK', rate:'1 req',
        ragAnswer:'G', actionAnswer:'allow',
        notes:"Edge case: O'Brien contains a single quote — a legitimate Irish surname. The application's parameterised query handles this correctly. A single apostrophe in a name field is not an injection attempt without additional SQL syntax. Allow."
      },
      {
        name:'/api/v2/products', purpose:'GET — product listing with ID filter',
        endpoint:'/api/v2/products', inputField:'id', submittedValue:"4821",
        responseCode:'200 OK', rate:'2 reqs',
        ragAnswer:'G', actionAnswer:'allow',
        notes:"Normal integer product ID. No SQL metacharacters, rate is consistent with a user viewing product pages. Allow."
      },
    ];
    // Adaptive difficulty — set by Analyst Pre-Brief diagnostic score
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION: mostly clear RED/GREEN, light AMBER
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED: more AMBER ambiguity, still varied
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD: balanced mix
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}  // always ≥1 GREEN
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  reportTeams:{ correct:'Application Security & DBA Team', incorrect:'Marketing Department' },
  reportHint: 'SQL injection targets the database layer — which team owns application security and database administration?',

  completionText(_,sc){
    const att=sc.filter(s=>s.ragAnswer==='R').length;
    return `<div class="rc info">
      <div style="font-family:'Orbitron',monospace;font-size:11px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — WAF LOG ANALYSIS</div>
      <p style="margin-bottom:8px;"><strong>${att} injection attempt(s)</strong> identified in this capture window. ${att>0?'Any successful injection against TechCorp\'s payment portal could represent the initial access vector for the entire breach. Parameterised queries on every endpoint would have prevented all of these.':'No confirmed injection in this window — though the suspicious probes indicate the attacker was testing input handling.'}</p>
      <hr style="border-color:rgba(0,255,65,.15);margin:10px 0;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: DATABASES & SQL SECURITY</div>
      <p style="font-size:12px;line-height:1.6;">Examiners test: <strong>how SQL injection works</strong> (user input modifies query structure), <strong>parameterised queries as the fix</strong> (code and data separated structurally), <strong>SQL syntax</strong> (SELECT/WHERE/DROP/UNION), <strong>database concepts</strong> (primary/foreign keys, normalisation, ACID). A 6-mark "explain" question on SQL injection typically expects: mechanism, example, why it succeeds, the defence, and why the defence works.</p>
    </div>`;
  },

  actions:{ R:'block', A:'investigate', G:'allow' },
  actionLabels:{ block:'🚫 BLOCK & ALERT DBA', investigate:'🔍 FLAG FOR REVIEW', allow:'✅ ALLOW (LEGITIMATE)' },
  ragRules:{
    R:'Clear injection payload: SQL metacharacters with attack syntax → BLOCK & ALERT DBA',
    A:'Suspicious input: encoded payload, partial syntax, probe pattern → FLAG & INVESTIGATE',
    G:'Legitimate input: no SQL syntax, expected field content → ALLOW',
  },

  plenary:{
    reportHint: 'SQL injection targets the database layer — which team owns application security and database administration?',
    analogy: 'SQL injection is like a form asking for your name, and someone writing "Alice OR everyone is Alice". The form was designed for a single name, but the "OR everyone is Alice" logic gets passed to the database which then returns every record — the attacker provided code disguised as data.',
    whatHappened: 'Several endpoints were being probed with SQL injection payloads ranging from classic authentication bypasses to destructive DROP TABLE commands and data-exfiltration UNION SELECT attacks. One legitimate submission containing an apostrophe (O\'Brien) required careful distinction from attack payloads.',
    keyMove: "Single quote + SQL keyword (OR, UNION, DROP, EXEC) + comment (--, /*) = injection attempt (RED). Base64/encoded payloads or trailing quote with no SQL keyword = suspicious probe (AMBER). Natural text, email addresses, integers with no SQL metacharacters = legitimate (GREEN).",
    realWorld: 'The Heartland Payment Systems breach (2008) — 130 million card numbers stolen — began with a single SQL injection in a web form. The entire incident could have been prevented by parameterised queries — one of the simplest, most important security practices in database-backed application development.',
    quiz:[
      {q:"SQL injection exploits the fact that user-supplied input is incorporated directly into a query. Why is this fundamentally dangerous?",options:['It allows the input to exceed the maximum field length, crashing the database','User input can change the STRUCTURE of the SQL query, not just supply data values','It prevents the database from caching queries efficiently'],correct:1},
      {q:"A login query reads: SELECT * FROM users WHERE username='[input]' AND password='[input]'. An attacker submits the username: ' OR '1'='1' -- \nWhat does the resulting WHERE clause evaluate to, and why does the login succeed?",options:['The clause becomes invalid SQL and the database skips authentication entirely','The clause always evaluates to TRUE for every row — the OR condition short-circuits the password check, and -- comments out the rest','The clause creates a new admin user with a blank password'],correct:1},
      {q:"The payload admin'-- is submitted as a username. The -- sequence causes:",options:['The database to execute the query twice, returning duplicate rows','Everything after it to be treated as a comment — the password check is discarded, and the query returns the admin row','The query to be logged but not executed, bypassing auditing'],correct:1},
      {q:'Parameterised queries (prepared statements) prevent SQL injection because:',options:['They automatically escape all special characters before they reach the database','SQL code and user data are sent to the database separately — user input is never interpreted as SQL syntax','They limit the length of user input to prevent buffer overflow attacks'],correct:1},
      {q:"A UNION SELECT injection — e.g. 1 UNION SELECT username, password FROM users -- works by:",options:['Replacing the original query entirely with the attacker\'s query','Appending a second SELECT query whose results are returned alongside the original — exposing data from a second table','Locking the target table so legitimate users cannot access it'],correct:1},
      {q:'Why is it important for web applications to validate and sanitise all user input before including it in database queries?',options:['Validation improves query speed by reducing the amount of data processed','Unvalidated input can be crafted to change the structure of the SQL query — allowing an attacker to access or destroy data they are not authorised to reach','Validation ensures names and addresses are stored in a consistent format, preventing errors in customer records'],correct:1},
      {q:'A web endpoint returns HTTP 500 Internal Server Error immediately after a form submission containing a single apostrophe. A security analyst should consider this:',options:['Normal — apostrophes in names like O\'Brien commonly cause formatting issues','A strong indicator of SQL injection vulnerability — the apostrophe broke the query syntax and the database returned an unhandled error','An indication that the server is under DDoS attack'],correct:1},
      {q:"Which of the following inputs is the most dangerous to pass to a login form that concatenates user input directly into a SQL query?",options:["A very long string of repeating characters (aaaaaaaaaa...)","The value: ' OR 1=1; DROP TABLE users; --","A valid email address containing a + character"],correct:1},
      {q:'The only fully reliable defence against SQL injection is:',options:['Filtering and blocking all inputs containing single quotes or SQL keywords','Using parameterised queries — structurally separating SQL code from user data so that input cannot alter query logic regardless of content','Hashing all user input before it reaches the database layer'],correct:1},
    
      {q:'What does the following SQL return?\nSELECT * FROM users WHERE username = \'admin\' AND active = 1',options:['Every row in the users table','All columns for rows where username is admin and the account is active','Deletes the admin user from the users table'],correct:1},
      {q:'Which SQL command would retrieve the name and salary of every employee earning over £30,000?',options:['SELECT name, salary FROM employees WHERE salary > 30000','GET name, salary FROM employees IF salary > 30000','FIND name, salary IN employees WHERE salary ABOVE 30000'],correct:0},
      {q:'What is referential integrity in a relational database?',options:['All data in the database is encrypted and cannot be accessed without the correct key','Foreign key values must correspond to a valid primary key in the referenced table — preventing orphaned records','Each table has exactly one primary key column'],correct:1},
      {q:'A database in Third Normal Form (3NF) is designed to eliminate:',options:['Duplicate primary keys across tables','Transitive dependencies — every non-key attribute must depend only on the primary key, not on other non-key attributes','Tables with more than three columns'],correct:1},
      {q:'The SQL command DELETE FROM orders WHERE order_id = 42 differs from DROP TABLE orders in that it:',options:['Removes one row while preserving the table structure; DROP removes the table and all data permanently','Is reversible with an UNDO command; DROP is permanent','Requires administrator privileges; DROP can be executed by any user'],correct:0},
      {q:'What does ACID stand for in database transaction processing, and why does it matter for a payment system?',options:['Access, Control, Integrity, Durability — ensures only authorised users can run transactions','Atomicity, Consistency, Isolation, Durability — ensures payment transactions either complete fully or not at all, preventing partial transfers','Availability, Confidentiality, Integrity, Distribution — the core security properties of a database'],correct:1},
    
    ]
  }
};


// ═══════════════════════════════════════════════════════════
// MODULE 4: FIREWALL RULE CHANGE REVIEW
// H446 §1.3.3 — Firewalls, proxies, network security
// ═══════════════════════════════════════════════════════════
MODULES.firewallReview = {
  id: 'firewallReview',
  name: 'FIREWALL RULE CHANGE REVIEW',

  emailSender: ()=>pick(['change-mgmt@infrasec.net','network-ops@company.net','noc@security.internal','it-change@company.net']),
  emailSubject: ()=>pick(['Change Requests: Firewall Rule Amendments — Analyst Approval Required','Network Change Management: Firewall Rules Awaiting Triage','IT Change Board: Firewall Rule Review Pending','NOC: Proposed Firewall Changes — Security Sign-Off Needed']),
  emailBody(){
    return 'Analyst,\n\nTechCorp\'s change management system shows firewall rule requests '
      +'submitted in the 48 hours before the breach. At least one looks suspicious — '
      +'it may have been submitted by the attacker to create an access pathway, '
      +'or by a compromised insider.\n\n'
      +'Any change that should have been rejected represents a control failure. '
      +'We need to identify exactly what was approved, what should have been escalated, '
      +'and what gave the attacker their foothold.\n\n'
      +'Load the Firewall Rule Manager.\n\n'
      +'Change Advisory Board — TechCorp IR';
  },
  diagnosticSummary:'Firewalls filter traffic by protocol, port, direction and IP. Key ports: 22 SSH, 80 HTTP, 443 HTTPS, 3389 RDP, 3306 MySQL. Principle of least privilege means granting only minimum access needed. A DMZ places public-facing servers between internet and internal network. CIDR /32=one IP, /24=256 IPs, /0=all IPs. Implicit deny means anything not explicitly permitted is blocked.',
  diagnosticQuestions:[
    {q:'What is a firewall\'s primary function',opts:['Filtering network traffic based on security rules','Assigning IP addresses to devices on the network','Encrypting all data that passes through it'],ok:0,hint:'Firewalls permit or deny traffic based on configurable rules — IP, port, protocol, direction.'},
    {q:'What is a network port',opts:['A physical socket on a switch or router','A logical endpoint numbered to distinguish different services','An opening in a firewall allowing all traffic'],ok:1,hint:'Port numbers route incoming traffic to the correct application — 80=HTTP, 443=HTTPS, 22=SSH.'},
    {q:'What does inbound traffic mean',opts:['Traffic leaving the local device to the internet','Traffic circulating between internal devices only','Traffic arriving at the network from an external source'],ok:2,hint:'Inbound = arriving. Outbound = leaving. Firewalls typically restrict inbound more strictly.'},
    {q:'What does principle of least privilege mean',opts:['Users should have only the access rights they need for their role','Junior staff should have the minimum pay during probation','Legacy systems should carry the most restrictive settings'],ok:0,hint:'Least privilege limits blast radius — a compromised account with minimal rights causes minimal damage.'},
    {q:'What is the purpose of encryption in network communication',opts:['To speed up data transmission by compressing packets','To convert data into a form that cannot be read by anyone without the correct key, protecting it from interception','To verify that data has not been altered during transmission'],ok:1,hint:'Network encryption protects data in transit — even if packets are intercepted, the contents cannot be read without the decryption key.'},
    {q:'What does a rule allowing traffic from any source mean for security',opts:['It means the server can communicate faster because no address checking is needed','It means connections from any device anywhere on the internet are permitted which significantly increases exposure to attack','It means all traffic is encrypted before it enters the network'],ok:1,hint:'Firewalls should restrict source addresses where possible — allowing any source maximises the attack surface.'},
,
    {q:'What is the difference between an encrypted and an unencrypted remote access connection',opts:['Encrypted connections are faster because they use compression','Unencrypted connections send all data including passwords as readable text; encrypted connections protect the session from interception','Encrypted connections require a physical security token while unencrypted do not'],ok:1,hint:'Telnet is unencrypted — everything including passwords is visible to anyone on the network. Secure Shell (SSH) encrypts the session.'},
,
    {q:'Why is it important to keep software and operating systems up to date with security patches',opts:['Updates improve performance by removing unused features','Patches fix known vulnerabilities — attackers actively exploit unpatched systems','Updates ensure compliance with the Data Protection Act 1998'],ok:1,hint:'Security patches close vulnerabilities that have been discovered and reported — unpatched systems remain exposed to known attack methods.'},
    {q:'Why should firewall rules follow the principle of least privilege',opts:['To reduce the number of rules the firewall has to process, making it faster','So that only the minimum traffic needed for legitimate business is allowed through, reducing the risk of exploitation','To ensure all traffic is encrypted before it reaches the server'],ok:1,hint:'Least privilege means denying everything by default and only allowing what is specifically needed.'},
,
    {q:'Why is allowing remote desktop access from any internet address considered a security risk',opts:['Remote desktop sessions use more bandwidth than other types of connection','Any attacker on the internet can attempt to log in — exposed remote access services are frequently targeted by automated attacks','Remote desktop software is incompatible with firewall rules so cannot be protected'],ok:1,hint:'Remote access services exposed directly to the internet are a major attack vector — access should be restricted or routed through a VPN.'},
,
    {q:'What is network segmentation',opts:['Dividing network cables into physical sections','Dividing a network into isolated zones to contain breaches','Allocating bandwidth evenly between connected devices'],ok:1,hint:'Segmentation limits lateral movement — a device in one zone can\'t freely reach another zone.'},
    {q:'What is a VPN and why do organisations use it',opts:['A type of antivirus software that scans network traffic for threats','A virtual private network that creates an encrypted tunnel allowing remote users to securely access internal systems over the internet','A service that blocks adverts and tracks on websites by filtering outbound traffic'],ok:1,hint:'VPNs allow employees working from home or travelling to access internal company systems as if they were on the office network — all traffic is encrypted.'},
    {q:'Why is Telnet insecure',opts:['It sends all data including passwords in plaintext','It is too slow for modern network speeds','It requires an expensive hardware certificate'],ok:0,hint:'SSH replaced Telnet precisely because Telnet credentials travel unencrypted.'},
    {q:'What is the purpose of network monitoring in an organisation',opts:['To slow down excessive internet usage by staff during working hours','To detect unusual patterns of traffic that may indicate a security incident or policy breach','To automatically update all software on devices connected to the network'],ok:1,hint:'Monitoring creates a baseline of normal behaviour — deviations from this baseline can be an early indicator of attack.'},
,
    {q:'What is a proxy server used for in a corporate network',opts:['To provide wireless connectivity to devices that cannot use a wired connection','To act as an intermediary between internal users and the internet, enabling content filtering, caching, and logging','To assign unique IP addresses to devices connecting to the local network'],ok:1,hint:'Proxies can enforce acceptable use policies by blocking categories of website and logging all web traffic.'},
,
    {q:'What is a subnet in networking',opts:['A single cable connecting two network devices directly','A logically separated portion of a network, typically grouping devices with a common purpose or security requirement','A type of wireless access point used in large buildings'],ok:1,hint:'Subnets divide a larger network into smaller segments, which can improve performance and allow different security policies to apply to different groups of devices.'},
,
    {q:'What does a network firewall examine to decide whether to allow or block traffic',opts:['The content of files attached to emails passing through the network','Packet headers including source and destination IP addresses and the service or port being used','The browsing history of the user generating the traffic'],ok:1,hint:'Firewalls inspect packet headers — source IP, destination IP, and service type — and compare them against configured rules.'},
    {q:'What is outbound traffic filtering on a firewall used to prevent',opts:['It prevents external attackers connecting to internal servers','It blocks internal devices from sending data to unauthorised external destinations, limiting the impact of a malware infection','It stops internal users from receiving too many emails at once'],ok:1,hint:'Outbound filtering matters as much as inbound — malware installed on an internal device needs to communicate outward to receive instructions or exfiltrate data.'},
    {q:'What does outbound filtering achieve',opts:['Prevents malware on internal devices from sending data outward or receiving instructions from attackers','Prevents all data from ever leaving the network','Filters only outgoing email to remove spam'],ok:0,hint:'Outbound filtering catches malware calling home, data exfiltration, and leaking misconfigured services.'},
    {q:'Why should a database server not be directly accessible from the internet',opts:['Database servers are too slow to handle direct internet connections efficiently','Exposing a database directly allows attackers to attempt to query or modify it without going through the application layer security controls','Database servers use a different type of network cable that cannot connect to internet routers'],ok:1,hint:'Databases should sit behind a web application server — the application handles authentication and validation before passing queries to the database.'},

  ],
  tools: {
    correct: 'Firewall Rule Manager',
    decoys: ['Packet Capture Analyser','Encryption Audit Tool','SQL Query Log Viewer','Legal Reference Database','Process Monitor','Email Header Analyser','Certificate Checker']
  },

  briefing: {
    title: 'Firewall Rule Change Review',
    tagline: 'Evaluating network access control requests against security principles',
    summary: 'A firewall controls which traffic is permitted to enter and leave a network by matching packets against an ordered ruleset. Stateful firewalls additionally track connection state, allowing returning traffic for established sessions. Proxy servers add a layer between client and server, filtering content and masking internal IP addresses. The principle of least privilege mandates granting only the minimum access required. A single misconfigured rule — opening SSH or RDP to the internet, or allowing unrestricted outbound access — can compromise an entire network.',
    watchFor: 'Rules allowing inbound traffic from 0.0.0.0/0 (any IP — the entire internet) on sensitive ports • High-risk ports open to internet: 22 (SSH), 23 (Telnet), 3389 (RDP), 5900 (VNC) • Overly broad port ranges (0–65535 all ports) • Outbound rules to any destination with no destination restriction • Rules with vague justification ("business need", "developer request") • Any use of Telnet (unencrypted) instead of SSH',
    realWorld: 'The 2020 SolarWinds supply chain attack exploited a legitimate firewall rule permitting the Orion monitoring software to make outbound HTTP connections to the internet. Attackers embedded a backdoor in a software update and used this rule as a covert C2 channel — the rule was never questioned because it appeared routine. Over 18,000 organisations were compromised before the attack was detected months later.'
  },

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — reject immediately
      {
        name:'CR-2025-0041', purpose:'Allow ALL inbound TCP port 22 (SSH) from internet', service:'SSH (port 22)', source:'0.0.0.0/0 — any internet IP',
        protocol:'TCP', port:'22', direction:'Inbound', requestedBy:'Dev Team', justification:'Remote server management',
        ragAnswer:'R', actionAnswer:'reject',
        notes:'Exposing SSH (port 22) to 0.0.0.0/0 (the entire internet) creates an enormous attack surface for brute-force and credential stuffing attacks. Reject. Proper practice: restrict SSH access to specific known admin IP ranges, or require VPN access first.'
      },
      {
        name:'CR-2025-0044', purpose:'Allow inbound TCP port 3389 (RDP) from 0.0.0.0/0', service:'RDP (port 3389)', source:'0.0.0.0/0 — any internet IP',
        protocol:'TCP', port:'3389', direction:'Inbound', requestedBy:'IT Support', justification:'Remote desktop access for support',
        ragAnswer:'R', actionAnswer:'reject',
        notes:'RDP exposed to the internet is one of the most commonly exploited configurations — used in ransomware attacks including WannaCry and NotPetya. Reject. Require VPN + MFA before any internal RDP is accessible, never expose port 3389 directly.'
      },
      {
        name:'CR-2025-0047', purpose:'Allow outbound TCP port 23 (Telnet) to any destination', service:'Telnet (port 23)', source:'Any destination',
        protocol:'TCP', port:'23', direction:'Outbound', requestedBy:'Legacy Systems Team', justification:'Connection to legacy router management',
        ragAnswer:'R', actionAnswer:'reject',
        notes:'Telnet transmits all data — including credentials — in plaintext. It was superseded by SSH in 1995. Reject and require migration to SSH for all remote management. This is not a timing issue; Telnet should never be used.'
      },
      {
        name:'CR-2025-0053', purpose:'Allow outbound TCP 0–65535 (all ports) from Finance workstations', service:'All ports (0–65535)', source:'Finance workstations',
        protocol:'TCP', port:'0–65535', direction:'Outbound', requestedBy:'Finance Manager', justification:'Application accessing various cloud services',
        ragAnswer:'R', actionAnswer:'reject',
        notes:'Permitting all outbound ports from Finance workstations would allow malware on those machines to contact any C2 server on any port — and would permit data exfiltration on non-standard ports. Reject. Request a specific list of destination services and open only those ports.'
      },
      // AMBER — escalate for further review
      {
        name:'CR-2025-0038', purpose:'Allow inbound HTTPS (443) from subnet 192.168.50.0/24 to app server', service:'HTTPS (port 443)', source:'192.168.50.0/24 (internal)',
        protocol:'TCP', port:'443', direction:'Inbound', requestedBy:'App Team', justification:'Internal app team testing new microservice',
        ragAnswer:'A', actionAnswer:'escalate',
        notes:'HTTPS on port 443 to a specific internal subnet is lower risk than internet-facing, but the justification lacks specifics: which app server? What microservice? When does this expire? Escalate to confirm the source subnet, destination, and add an expiry date. Not automatically safe without these details.'
      },
      {
        name:'CR-2025-0049', purpose:'Allow outbound TCP 8080 from developer workstations to any', service:'HTTP alt (port 8080)', source:'Developer workstations',
        protocol:'TCP', port:'8080', direction:'Outbound', requestedBy:'Development Lead', justification:'Developer tools and API testing',
        ragAnswer:'A', actionAnswer:'escalate',
        notes:'Port 8080 is a common alternative HTTP port used by development tools. The destination ("any") is too broad — this could be scoped to specific development environments. Escalate to determine if destination can be restricted. Not an immediate reject, but needs tightening.'
      },
      {
        name:'CR-2025-0055', purpose:'Allow inbound TCP 5900 (VNC) from 10.20.0.0/16 to server farm', service:'VNC (port 5900)', source:'10.20.0.0/16 (65,536 IPs)',
        protocol:'TCP', port:'5900', direction:'Inbound', requestedBy:'Systems Administrator', justification:'Remote server console access from management VLAN',
        ragAnswer:'A', actionAnswer:'escalate',
        notes:'VNC on port 5900 from a /16 internal subnet (/16 = 65,536 addresses). The management VLAN access is plausible, but the scope is too wide. Escalate: can this be restricted to specific admin host IPs? VNC access to servers should require strong authentication.'
      },
      // GREEN — approve
      {
        name:'CR-2025-0033', purpose:'Allow inbound HTTPS (443) to web server in DMZ from internet', service:'HTTPS (port 443)', source:'Internet → DMZ web server',
        protocol:'TCP', port:'443', direction:'Inbound', requestedBy:'Web Team', justification:'Public-facing web application requires HTTPS access',
        ragAnswer:'G', actionAnswer:'approve',
        notes:'Standard configuration for a public web server in the DMZ. HTTPS on port 443 is the expected protocol. Web servers in the DMZ are designed to accept inbound internet connections — this is the intended network architecture. Approve.'
      },
      {
        name:'CR-2025-0036', purpose:'Allow outbound HTTPS (443) from internal hosts to Microsoft Update servers', service:'HTTPS (port 443)', source:'Internal → Microsoft CDN',
        protocol:'TCP', port:'443', direction:'Outbound', requestedBy:'IT Infrastructure', justification:'Windows Update and Microsoft 365 traffic',
        ragAnswer:'G', actionAnswer:'approve',
        notes:'Outbound HTTPS to Microsoft Update CDN addresses is standard and required for patch management. Well-documented, specific destination, legitimate business justification. Approve.'
      },
      {
        name:'CR-2025-0039', purpose:'Allow outbound UDP 53 (DNS) to company DNS servers only', service:'DNS (port 53)', source:'Internal → managed resolvers',
        protocol:'UDP', port:'53', direction:'Outbound', requestedBy:'Network Team', justification:'DNS queries from internal hosts to managed resolvers',
        ragAnswer:'G', actionAnswer:'approve',
        notes:'Restricting DNS queries to company-managed resolvers (rather than allowing DNS to any external server) is a security best practice — it prevents DNS tunnelling to arbitrary external servers. Tightly scoped and justified. Approve.'
      },
      {
        name:'CR-2025-0042', purpose:'Allow inbound SMTP (25) to mail relay in DMZ from internet', service:'SMTP (port 25)', source:'Internet → DMZ mail relay',
        protocol:'TCP', port:'25', direction:'Inbound', requestedBy:'Email Infrastructure', justification:'Inbound email delivery from external mail servers',
        ragAnswer:'G', actionAnswer:'approve',
        notes:'A mail relay in the DMZ accepting inbound SMTP on port 25 from the internet is standard email infrastructure. The relay should be isolated in the DMZ and forward only to the internal mail server. This is expected and correctly scoped. Approve.'
      },
    ];
    // Adaptive difficulty — set by Analyst Pre-Brief diagnostic score
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION: mostly clear RED/GREEN, light AMBER
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED: more AMBER ambiguity, still varied
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD: balanced mix
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}  // always ≥1 GREEN
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  reportTeams:{ correct:'Security Architecture Team', incorrect:'Human Resources Department' },
  reportHint: 'Firewall misconfiguration is a network architecture risk — which team owns security design decisions?',

  completionText(_,sc){
    const rej=sc.filter(s=>s.ragAnswer==='R').length;
    const esc=sc.filter(s=>s.ragAnswer==='A').length;
    return `<div class="rc info">
      <div style="font-family:'Orbitron',monospace;font-size:11px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — CHANGE REQUEST AUDIT</div>
      <p style="margin-bottom:8px;"><strong>${rej} rule(s) should have been rejected</strong>, ${esc} escalated for further review. ${rej>0?'At least one of these approved changes may have given the attacker their initial network foothold — this is a control failure that will feature in the post-incident report.':'The change management process held up — but several requests needed tighter scoping.'}</p>
      <hr style="border-color:rgba(0,255,65,.15);margin:10px 0;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: FIREWALLS, PROXIES & NETWORK SECURITY</div>
      <p style="font-size:12px;line-height:1.6;">Examiners test: <strong>stateless vs stateful firewalls</strong> (packet filter vs connection tracking), <strong>DMZ architecture</strong> (why public-facing services are separated), <strong>principle of least privilege</strong>, <strong>proxies vs firewalls</strong> (what each controls). A common 4-mark question: "Explain the role of a DMZ in network security" — model answer: (1) subnetwork between internet and internal network, (2) hosts public-facing services, (3) limits blast radius if server is compromised, (4) traffic must be explicitly permitted inward.</p>
    </div>`;
  },

  actions:{ R:'reject', A:'escalate', G:'approve' },
  actionLabels:{ reject:'🚫 REJECT', escalate:'🟡 ESCALATE FOR REVIEW', approve:'✅ APPROVE' },
  ragRules:{
    R:'Security risk: exposes sensitive ports or services to untrusted networks → REJECT',
    A:'Requires further information: too broad, insufficient justification → ESCALATE',
    G:'Appropriate, justified, tightly scoped access control change → APPROVE',
  },

  plenary:{
    reportHint: 'Firewall misconfiguration is a network architecture risk — which team owns security design decisions?',
    analogy: 'Reviewing firewall rules is like approving keys to a building. Most requests are reasonable (front door key for the receptionist). Some need more thought (why does the cleaner need a key to the server room?). And some should be refused outright (why does an intern need a master key to every door?).',
    whatHappened: 'A batch of change requests ranged from clear rejections (SSH and RDP exposed to the internet, Telnet, all-ports outbound) to requests needing tighter scoping (broad subnets, missing expiry dates) to entirely legitimate and appropriate rules (HTTPS to DMZ web server, DNS to managed resolvers).',
    keyMove: '0.0.0.0/0 = any IP on the internet. Port 22 (SSH), 3389 (RDP), 23 (Telnet), 5900 (VNC) to internet = reject. All-ports outbound = reject. HTTPS to DMZ web server = standard, approve. Always ask: can this be more tightly scoped? Is the justification specific?',
    realWorld: 'The SolarWinds attack (2020) used a legitimate, unquestioned outbound firewall rule as a covert C2 channel. 18,000 organisations were compromised. The rule appeared routine — it was not. Understanding exactly what a firewall rule permits — and what it silently allows — is what separates a security-aware network engineer from one who just ticks boxes.',
    quiz:[
      {q:'What is the primary purpose of a network firewall?',options:['To speed up internet connections by caching frequently visited websites','To monitor incoming and outgoing network traffic and block connections that do not match approved rules','To assign IP addresses to devices connecting to the network'],correct:1},
      {q:'Why is Telnet considered insecure for remote server management?',options:['It uses an outdated authentication mechanism that limits passwords to 8 characters','It transmits all data, including credentials, in plaintext over the network','It is too slow for modern high-bandwidth networks'],correct:1},
      {q:'Why is it important to restrict which IP addresses can connect to a server remotely?',options:['Restricting IP addresses increases the server\'s processing speed','Allowing connections from any address exposes the server to attacks from anywhere on the internet; restricting access reduces the attack surface','Firewalls block all connections by default so this restriction is only needed for legacy systems'],correct:1},
      {q:'What type of attack overwhelms a server with traffic from a single source, making it unavailable to legitimate users?',options:['A man-in-the-middle attack — the attacker intercepts traffic between two parties','A Denial of Service (DoS) attack — the attacker sends so much traffic from one source that the server cannot respond to real requests','A phishing attack — the attacker tricks users into revealing credentials'],correct:1},
      {q:'The principle of least privilege states that:',options:['All users should be granted administrator rights by default, revoked only if misused','Users and systems should be granted only the minimum access rights necessary to perform their function','Privileged administrators should use the least secure authentication method to simplify access'],correct:1},
      {q:'What does network segmentation mean, and why does it improve security?',options:['Compressing network traffic into segments to speed up transmission','Dividing a network into separate zones so that a compromise in one area cannot automatically spread to the rest','Installing multiple firewalls in a single location to process traffic faster'],correct:1},
      {q:'A forward proxy in a corporate network:',options:['Accepts inbound internet connections on behalf of a web server, masking the server\'s internal IP','Makes outbound requests on behalf of internal clients, masking their internal IP addresses from external servers','Replaces the function of the internal DNS server for hostname resolution'],correct:1},
      {q:'What is the role of a proxy server in content filtering for an organisation?',options:['It encrypts all web traffic so that outside observers cannot read it','It forwards requests on behalf of internal users and can be configured to block access to certain categories of website','It assigns unique IP addresses to devices connecting to the internal network'],correct:1},
      {q:'A company restricts employees to only using email and web browsing on the work network. Which device enforces this?',options:['A router — which connects the company network to the internet','A firewall — which can be configured to allow only specific types of traffic','A switch — which connects devices within the local network'],correct:1},
    
      {q:'A firewall is configured with rules that allow specific types of traffic. What happens to traffic that does not match any rule?',options:['It is forwarded to a backup server for manual inspection','It is blocked by default — firewalls typically deny anything not explicitly permitted','It is allowed through after a brief delay to give the administrator time to review it'],correct:1},
      {q:'A company wants to ensure that staff in one department cannot access the file servers used by another department. What technology would achieve this?',options:['A hub — which connects all devices on the network to the same shared medium','A firewall or network segmentation — dividing the network into separate zones with access rules between them','A router — which provides the connection to the internet'],correct:1},
      {q:'What is penetration testing, and why do organisations carry it out?',options:['Testing that employees have read the acceptable use policy before being given network access','Authorised simulated attack on a network or system to find vulnerabilities before malicious attackers do','Speed testing of network infrastructure to identify bottlenecks before they affect performance'],correct:1},
      {q:'A company stores personal data for customers. Under the Data Protection Act 1998, which of the following is a requirement?',options:['All data must be stored on servers physically located in the UK','Data must be kept no longer than necessary, stored securely, and used only for the purpose it was collected','Customers must be given a printed copy of their data every six months'],correct:1},
      {q:'What is the purpose of a VPN in corporate network security?',options:['To block inbound connections from untrusted external IP addresses at the perimeter','To create an encrypted tunnel that allows remote users to securely access internal resources over an untrusted network','To translate private internal IP addresses to a public IP for internet communication'],correct:1},
      {q:'Why should remote access services not be exposed directly to the internet without additional controls?',options:['Remote access services use too much bandwidth when accessed from outside the office','Exposing them directly allows anyone on the internet to attempt to log in — they should be protected by a VPN or restricted to known IP addresses','Remote access services are only designed to work on local networks and do not function correctly over the internet'],correct:1},
    ]
  }
};


// ═══════════════════════════════════════════════════════════
// MODULE 5: LEGAL & COMPLIANCE INCIDENT REVIEW
// H446 §1.5.1 — Computing legislation:
//   Computer Misuse Act 1990 (S1, S2, S3)
//   Data Protection Act 1998
//   Copyright Designs & Patents Act 1988
//   Regulation of Investigatory Powers Act 2000
// ═══════════════════════════════════════════════════════════
MODULES.legalCompliance = {
  id: 'legalCompliance',
  name: 'LEGAL & COMPLIANCE INCIDENT REVIEW',

  emailSender: ()=>pick(['compliance@company.net','legal@company.net','ciso@company.net','hr-legal@company.net']),
  emailSubject: ()=>pick(['Compliance Review: Reported Incidents Require Legal Assessment','Legal Team: Incident Log — Analyst Classification Needed','CISO Office: Computing Law Incidents Awaiting Triage','HR & Legal: Incident Reports — Legislation Mapping Required']),
  emailBody(){
    return 'Analyst,\n\nWith TechCorp Global\'s breach confirmed, legal are under immediate pressure. '
      +'The DPA 1998 notification obligation to the ICO runs from the point of awareness — '
      +'that clock is already ticking.\n\n'
      +'We need each incident classified correctly: criminal offences to the police under the CMA, '
      +'data protection breaches to the ICO, policy violations handled internally. '
      +'Misclassifying a criminal act as an internal matter is itself a serious liability.\n\n'
      +'Load the Legal Reference Database.\n\n'
      +'Legal Director — TechCorp Global';
  },
  diagnosticSummary:'Four UK Acts. Computer Misuse Act 1990 (CMA) is criminal: Section 1 unauthorised access 2 years max, Section 2 access with intent 5 years, Section 3 impairment and malware 10 years. Data Protection Act 1998 (DPA) is regulatory enforced by the ICO. CDPA 1988 covers software copyright. RIPA 2000 covers interception of communications and is criminal. CMA offences go to the police. DPA breaches go to the ICO.',
  diagnosticQuestions:[
    {q:'What does CMA stand for',opts:['Computer Misuse Act','Cybercrime and Misconduct Act','Computer Management Act'],ok:0,hint:'CMA 1990 is the primary UK criminal law covering unauthorised access to computer systems.'},
    {q:'What is the ICO',opts:['The International Computing Organisation','The Information Commissioner\'s Office — UK data protection regulator','The Internet Content Oversight authority'],ok:1,hint:'The ICO is the UK\'s independent regulator for data protection — it can investigate organisations, issue enforcement notices, and impose fines for serious breaches.'},
    {q:'What is unauthorised access under the CMA',opts:['Accessing a computer without knowing its password','Accessing a system outside authorised working hours','Accessing a computer system without authorisation from its owner'],ok:2,hint:'The CMA requires no malicious intent for S1 — accessing without permission is itself the offence.'},
    {q:'What is personal data under UK law',opts:['Any information that identifies or can identify a living individual','Any data a person has created themselves','Any data stored on a personal device'],ok:0,hint:'Personal data includes names, email addresses, IP addresses, and location data.'},
    {q:'What distinguishes criminal from civil law',opts:['Criminal covers minor offences, civil covers serious ones','Criminal involves state prosecution, civil involves private disputes','Civil applies to businesses, criminal applies to individuals'],ok:1,hint:'Criminal = state prosecutes, can result in imprisonment. Civil = private parties seeking compensation.'},
    {q:'What does the CDPA protect',opts:['People\'s right to copy published works for personal study','A fee charged for all commercial use of content','Creators\' exclusive rights over original works including software'],ok:2,hint:'CDPA 1988 treats software as a literary work — copying without licence is copyright infringement.'},
    {q:'What does the Data Protection Act 1998 say about how personal data must be processed',opts:['It must be processed secretly so individuals cannot see what data is held about them','It must be processed fairly and lawfully — organisations need a legitimate reason to collect and use personal data','It must be processed overseas to ensure security from UK government access'],ok:1,hint:'The first principle of the DPA 1998 requires that any processing of personal data has a legitimate basis — consent, contract or legal obligation are examples.'},
    {q:'What is a data breach',opts:['A hacker gaining access to a government network','Protected data accessed, disclosed or destroyed without authorisation','A failure to complete a scheduled database backup'],ok:1,hint:'Breaches include accidental disclosure, lost laptops, and misconfigured cloud storage.'},
    {q:'Under the Computer Misuse Act 1990, what must an attacker have done to be guilty of the basic offence',opts:['They must have stolen data worth more than a specified financial threshold','They must have accessed a computer or data that they were not authorised to access','They must have caused measurable financial damage to the owner of the system'],ok:1,hint:'The basic CMA offence is simply accessing a computer without authorisation — no damage or further intent is needed for a prosecution.'},
,
    {q:'the most serious Computer Misuse Act offence covers',opts:['Unauthorised acts that impair computer systems — up to 10 years','Accessing a computer system without permission','Accessing with intent to commit a further offence'],ok:0,hint:'S3 covers deploying malware, destroying data, disrupting systems. The heaviest CMA sentence.'},
    {q:'Which body handles criminal CMA offences',opts:['The Financial Conduct Authority','The police and Crown Prosecution Service','The Information Commissioner\'s Office'],ok:1,hint:'CMA offences are crimes — police investigate, CPS prosecutes. ICO handles DPA regulatory matters.'},
    {q:'What does CDPA mean for software',opts:['Software ideas and algorithms can be patented','Software names and logos are protected as trademarks','Software is a literary work protected from copying without licence'],ok:2,hint:'Copying, distributing or modifying software without a licence infringes copyright under CDPA 1988.'},
    {q:'What is an acceptable use policy',opts:['A policy defining what employees may and may not do with IT','A policy listing software the company is licensed to use','A policy restricting internet bandwidth for personal use'],ok:0,hint:'AUP violations are typically internal disciplinary matters unless they also breach criminal law.'},
    {q:'What is informed consent in data collection',opts:['Noting data use in the small print of terms','Users actively agreeing after being clearly told the purpose','Staff being trained on data handling procedures'],ok:1,hint:'Consent must be freely given, specific, informed and unambiguous. Pre-ticked boxes don\'t count.'},
    {q:'What does the Data Protection Act 1998 require of organisations with regard to the security of personal data they hold',opts:['Data must only be used for its original purpose','Data must be kept accurate and regularly updated','Appropriate security measures must protect personal data'],ok:2,hint:'Principle 7 directly concerns cybersecurity — inadequate security can trigger ICO enforcement.'},
    {q:'Under the Data Protection Act 1998, organisations that collect personal data must register with which body?',options:['The National Crime Agency (NCA) — which prosecutes data protection offences','The Information Commissioner\'s Office (ICO) — the independent regulator for data protection','The Home Office — which oversees all privacy legislation on behalf of the government'],correct:1},
    {q:'Under the Computer Misuse Act 1990, what makes the intermediate offence more serious than basic unauthorised access',opts:['The intermediate offence requires physical damage to hardware','The intermediate offence requires the attacker to have intended to commit a further serious crime at the time of the access','The intermediate offence requires multiple victims rather than a single target'],ok:1,hint:'Intent matters legally — an attacker who breaks into a system planning to commit fraud is treated more seriously than one who accessed it out of curiosity.'},
    {q:'Under the Data Protection Act 1998, for how long should an organisation keep personal data',opts:['Indefinitely — so it is available if needed in future','No longer than necessary for the purpose for which it was collected — keeping data beyond this point breaches the Act','For exactly 7 years — this is the standard retention period for all personal data'],ok:1,hint:'The DPA 1998 requires that data is not kept longer than necessary — the exact period depends on the purpose, but indefinite retention without justification is a breach.'},
    {q:'Copying software without a licence may breach',opts:['CDPA 1988 — Copyright Designs and Patents Act','CMA 1990 — Computer Misuse Act','The Freedom of Information Act 2000 — which gives the public right of access to information held by public authorities'],ok:0,hint:'CDPA 1988 protects software as a literary work. Copying without licence = copyright infringement.'},
    {q:'What does data minimisation mean',opts:['Storing data in the smallest possible file format','Collecting only the data necessary for the stated purpose','Deleting all data immediately after each transaction'],ok:1,hint:'Data you don\'t hold can\'t be stolen or misused — minimisation reduces both risk and breach impact.'},
    {q:'What does the Computer Misuse Act 1990 say about accessing data you are not authorised to access even if you have general access to the system',opts:['It is only illegal if you copy or delete the data — simply viewing it is not an offence','Accessing specific data you are not authorised to see is still a CMA offence even if you have legitimate access to the same computer','The CMA only applies to hacking from outside an organisation — internal staff are covered by employment law instead'],ok:1,hint:'Authorisation matters in the CMA — a bank employee who accesses an account they have no business reason to view is still committing an offence even though they have legitimate system access.'},
  ],
  tools: {
    correct: 'Legal Reference Database',
    decoys: ['Packet Capture Analyser','Encryption Audit Tool','SQL Query Log Viewer','Firewall Rule Manager','Process Monitor','Email Header Analyser','Vulnerability Scanner']
  },

  briefing: {
    title: 'Legal & Compliance Incident Review',
    tagline: 'Applying UK computing legislation to real-world security incidents',
    summary: 'Four UK laws govern computing: the Computer Misuse Act 1990 (CMA) criminalises unauthorised computer access — S1: unauthorised access (max 2 years); S2: unauthorised access with intent for further offence (max 5 years); S3: unauthorised acts impairing computer operation, e.g. malware deployment (max 10 years). The Data Protection Act 1998 (DPA) regulates personal data processing. The Copyright Designs and Patents Act 1988 (CDPA) protects software as literary work. The Regulation of Investigatory Powers Act 2000 (RIPA) governs lawful interception of communications.',
    watchFor: 'Unauthorised system access → CMA S1 • Unauthorised access with further intent (e.g. accessing systems to steal data) → CMA S2 • Installing malware, modifying/deleting data without authority → CMA S3 • Personal data processed without consent, shared unlawfully, or retained beyond necessity → DPA 1998 • Copying or distributing software without licence → CDPA 1988 • Intercepting communications without lawful authority → RIPA 2000',
    realWorld: 'The CMA 1990 has been used in prosecutions ranging from a disgruntled employee deleting company files (S3) to a researcher who accessed a company database without authorisation even to expose a vulnerability (S1 — intent is irrelevant). In 2018, Facebook was fined £500,000 (the maximum under DPA 1998) by the ICO for the Cambridge Analytica scandal — demonstrating the DPA\'s enforcement reach. GDPR (2018) superseded and extended DPA 1998 with far higher maximum fines — but the four Acts above remain the foundation of UK computing law.'
  },

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — criminal offences, report to police
      {
        name:'INC-2025-0014', purpose:'Keylogger installed on colleague\'s computer',
        incident:'Employee installed software keylogger on a colleague\'s workstation to capture passwords', legislation:'Computer Misuse Act 1990', section:'Section 3',
        ragAnswer:'R', actionAnswer:'reportPolice',
        notes:'Installing a keylogger without authority constitutes an unauthorised act intended to impair another\'s computer and intercept data — CMA S3 (max 10 years). Report to police. This is not merely a policy issue; it is a criminal offence regardless of whether the perpetrator is an employee.'
      },
      {
        name:'INC-2025-0019', purpose:'Ex-staff remote access after termination',
        incident:'Ex-employee used retained credentials to access the CRM database after employment ended', legislation:'Computer Misuse Act 1990', section:'Section 1',
        ragAnswer:'R', actionAnswer:'reportPolice',
        notes:'Accessing a computer system without authorisation — credentials were no longer valid post-termination — is CMA S1 (max 2 years). If the purpose was to extract data for a competitor, it may be S2 (max 5 years). Report to police and preserve evidence. Revoke all remaining access immediately.'
      },
      {
        name:'INC-2025-0022', purpose:'Ransomware deployed by insider threat',
        incident:'Junior system administrator deliberately encrypted file servers and demanded payment', legislation:'Computer Misuse Act 1990', section:'Section 3',
        ragAnswer:'R', actionAnswer:'reportPolice',
        notes:'Deploying ransomware — intentionally modifying computer material without authority to impair its operation — is CMA S3 (max 10 years). This is the most serious category under the CMA. Report to police immediately and engage incident response. Do not pay the ransom.'
      },
      {
        name:'INC-2025-0031', purpose:'Dev accessed production DB without auth',
        incident:'Developer bypassed access controls and queried the live customer database without approval, claiming they were investigating a performance issue', legislation:'Computer Misuse Act 1990', section:'Section 1',
        ragAnswer:'R', actionAnswer:'reportPolice',
        notes:'Intent does not negate culpability under CMA S1 — the developer accessed a computer system without authorisation. R v Gold & Schifreen (1988) and subsequent CMA cases confirm that "investigating" or "testing" without authority is still unauthorised access. Report to police.'
      },
      {
        name:'INC-2025-0035', purpose:'Staff intercepted manager\'s emails via network tap',
        incident:'Staff member configured a network tap on the manager\'s VLAN segment to capture their email communications', legislation:'Regulation of Investigatory Powers Act 2000', section:'Section 1',
        ragAnswer:'R', actionAnswer:'reportPolice',
        notes:'Unlawful interception of communications — capturing email content in transit — is an offence under RIPA 2000 S1 regardless of the network owner\'s identity. The employee had no lawful authority for interception. Report to police..'
      },
      // AMBER — regulatory breaches, report to ICO / legal
      {
        name:'INC-2025-0008', purpose:'Customer data sold without consent',
        incident:'Marketing manager sold a database of 45,000 customer email addresses to a third-party marketing firm without customer consent', legislation:'Data Protection Act 1998', section:'Principles 1 & 2',
        ragAnswer:'A', actionAnswer:'reportICO',
        notes:'Under DPA 1998, personal data must be processed fairly and lawfully (Principle 1) and only for specified purposes (Principle 2). Selling customer data without consent violates both. Report to the ICO. Customers must be notified. The ICO can issue enforcement notices and, under DPA 1998, fines up to £500,000.'
      },
      {
        name:'INC-2025-0011', purpose:'Payroll data sent to all staff in error',
        incident:'HR administrator sent an email containing all employees\' salaries and NI numbers to the entire company distribution list', legislation:'Data Protection Act 1998', section:'Principle 7',
        ragAnswer:'A', actionAnswer:'reportICO',
        notes:'Accidental disclosure of personal data (salary, NI numbers — "sensitive" under DPA 1998) breaches Principle 7: appropriate security measures must be in place. The ICO must be notified of significant accidental breaches. Affected individuals should be informed. Internal disciplinary action is also appropriate.'
      },
      {
        name:'INC-2025-0026', purpose:'Customer data kept 12 years past contract end',
        incident:'Audit discovered that customer personal data has been retained in the CRM system for 12 years after customers cancelled their accounts — no deletion policy exists', legislation:'Data Protection Act 1998', section:'Principle 5',
        ragAnswer:'A', actionAnswer:'reportICO',
        notes:'DPA 1998 Principle 5: personal data shall not be kept longer than is necessary for the specified purpose. Retaining inactive customer data for 12 years without justification is a clear breach. Report to ICO and implement a data retention and deletion policy immediately.'
      },
      // GREEN — internal policy violations (no criminal/regulatory breach)
      {
        name:'INC-2025-0003', purpose:'Unlicensed software installed on work device',
        incident:'IT audit found that an employee had installed unlicensed copies of design software on their company-issued laptop', legislation:'Copyright Designs & Patents Act 1988', section:'CDPA (internal)',
        ragAnswer:'G', actionAnswer:'internal',
        notes:'Installing unlicensed software violates CDPA 1988 and company IT policy, but this is primarily a licensing/policy issue handled internally. Remove unlicensed software, issue formal warning, purchase appropriate licences. Not a criminal referral in the first instance unless wilful large-scale piracy is involved.'
      },
      {
        name:'INC-2025-0007', purpose:'Analyst accessed own HR record',
        incident:'Junior analyst queried the HR database to view their own salary record and leave balance — access they are not supposed to have but the data was their own', legislation:'Not a breach', section:'Policy only',
        ragAnswer:'G', actionAnswer:'internal',
        notes:'Accessing your own data is not an offence under the CMA (no intent to harm, own data) or DPA (subject access rights exist). The analyst exceeded their system authorisation but the action caused no harm. Address the access control gap and issue a reminder of acceptable use policy. Internal matter only.'
      },
      {
        name:'INC-2025-0016', purpose:'Trainee SQL test on own dev server',
        incident:'Graduate trainee ran SQL injection payloads against the company\'s own development/test environment as a self-directed learning exercise, with no data exfiltration or damage', legislation:'Internal assessment required', section:'Context-dependent',
        ragAnswer:'G', actionAnswer:'internal',
        notes:'Testing on a company-owned test environment the trainee was authorised to use does not constitute unauthorised access (CMA S1 requires no authorisation). No data was at risk. However, this should have been approved in advance. Agree a responsible disclosure / learning process. Internal matter — no criminal referral.'
      },
    ];
    // Adaptive difficulty — set by Analyst Pre-Brief diagnostic score
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION: mostly clear RED/GREEN, light AMBER
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED: more AMBER ambiguity, still varied
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD: balanced mix
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}  // always ≥1 GREEN
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  reportTeams:{ correct:'Legal, Compliance & HR Department', incorrect:'Network Operations Centre' },
  reportHint: 'Incidents with legal implications need the people who handle law — which team combines legal knowledge with HR?',

  completionText(_,sc){
    const crim=sc.filter(s=>s.ragAnswer==='R').length;
    const reg=sc.filter(s=>s.ragAnswer==='A').length;
    return `<div class="rc info">
      <div style="font-family:'Orbitron',monospace;font-size:11px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — LEGAL ASSESSMENT</div>
      <p style="margin-bottom:8px;"><strong>${crim} criminal offence(s)</strong> (police notification required), <strong>${reg} regulatory breach(es)</strong> (ICO notification required). ${crim>0?'TechCorp must notify law enforcement immediately — delays in reporting criminal offences create additional legal exposure.':'No criminal offences confirmed in this case set, but the regulatory breaches still carry significant ICO enforcement risk.'}</p>
      <hr style="border-color:rgba(0,255,65,.15);margin:10px 0;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: COMPUTING LEGISLATION</div>
      <p style="font-size:12px;line-height:1.6;">Examiners test <strong>four Acts</strong>: CMA 1990 (S1 unauthorised access 2yr / S2 access with intent 5yr / S3 impairment 10yr), DPA 1998 (8 principles, ICO enforcement), CDPA 1988 (software as literary work), RIPA 2000 (interception). Scenario questions ask you to identify which Act applies — the trick is distinguishing CMA (computer access) from DPA (personal data) from RIPA (communication interception). Know all four Acts cold.</p>
    </div>`;
  },

  actions:{ R:'reportPolice', A:'reportICO', G:'internal' },
  actionLabels:{ reportPolice:'🚨 NOTIFY POLICE', reportICO:'📋 REPORT TO ICO', internal:'📝 INTERNAL REVIEW' },
  ragRules:{
    R:'Criminal offence: CMA 1990 (S1/S2/S3) or RIPA 2000 → NOTIFY POLICE',
    A:'Regulatory breach: Data Protection Act 1998 → REPORT TO ICO',
    G:'Policy/CDPA violation — no criminal element → INTERNAL REVIEW ONLY',
  },

  plenary:{
    reportHint: 'Incidents with legal implications need the people who handle law — which team combines legal knowledge with HR?',
    analogy: 'Classifying incidents under computing law is like triage in A&E: some require immediate escalation to specialist services (police for CMA offences), some need a specific authority (ICO for data protection), and some can be dealt with by the organisation itself (internal disciplinary).',
    whatHappened: 'A range of incidents required classification across four pieces of UK legislation. The key challenge was distinguishing genuinely criminal CMA offences from regulatory DPA breaches, from internal policy matters — and recognising that good intentions (investigating a bug, learning by doing) do not override the law.',
    keyMove: 'CMA S1: unauthorised access (max 2yr). CMA S2: unauthorised access with further intent (max 5yr). CMA S3: impairment of computer / malware (max 10yr). DPA 1998: unlawful personal data processing → ICO. RIPA 2000: unlawful interception → police. CDPA 1988: software piracy → primarily internal.',
    realWorld: 'The ICO fined Facebook £500,000 under DPA 1998 for the Cambridge Analytica scandal — the maximum possible under that Act. GDPR (2018) raised maximum fines to €20 million or 4% of global annual turnover, whichever is higher. The CMA has been used to prosecute cases from teenage hackers to state-sponsored actors. These laws are real, routinely enforced, and directly relevant to any computing career.',
    quiz:[
      {q:'The Computer Misuse Act 1990 created three criminal offences. The most basic offence covers:',options:['Accessing a computer or data without authorisation — no damage or further intent is required','Sending large volumes of email to overwhelm a mail server','Copying commercial software for personal use without a licence'],correct:0},
      {q:'Someone installs software on a network that encrypts all files and demands payment. Which Computer Misuse Act offence type applies?',options:['Basic unauthorised access — accessing a computer without permission','The most serious offence — deliberately impairing or disrupting computer systems or data','Unauthorised access with intent to commit a further offence such as fraud'],correct:1},
      {q:'The Data Protection Act 1998 is primarily concerned with:',options:['Preventing unauthorised access to government and public sector computer systems','The fair, lawful and proportionate processing of personal data by organisations and individuals','The licensing of commercial software products and the rights of software authors'],correct:1},
      {q:'An employee installs software on a company computer without permission and accesses confidential salary data. Which Act is most likely to apply?',options:['The Copyright Designs and Patents Act 1988 — because software is protected as a literary work','The Computer Misuse Act 1990 — because accessing data without authorisation is an offence even if the person is employed','The Data Protection Act 1998 — because salary data is personal data'],correct:1},
      {q:'Under the Copyright Designs and Patents Act 1988, software is protected as:',options:['A patented invention requiring registration with the Intellectual Property Office','An industrial design, giving automatic protection to the user interface','Literary work — the source code is treated as a form of writing with automatic copyright'],correct:2},
      {q:'Under the Computer Misuse Act 1990, what is the maximum prison sentence for the most serious offence — deliberately impairing computer systems or data?',options:['A maximum fine only — imprisonment is reserved for violent offences','5 years — reflecting that digital damage is treated like other serious criminal damage','10 years — reflecting the severity of attacks that can disrupt critical systems and infrastructure'],correct:2},
      {q:'An employee accesses a colleague\'s private email account without permission. Under which legislation does this primarily fall?',options:['Data Protection Act 1998 — processing the colleague\'s personal data without consent','The Computer Misuse Act 1990 — accessing another person\'s data without authorisation is an offence','Copyright Designs and Patents Act 1988 — the email content is literary work'],correct:1},
      {q:'Which organisation would a company notify following a significant accidental personal data breach affecting customers?',options:['The police, under the Computer Misuse Act 1990','The Information Commissioner\'s Office (ICO), under the Data Protection Act 1998','The Home Office, under the Regulation of Investigatory Powers Act 2000'],correct:1},
      {q:'The intermediate Computer Misuse Act offence is more serious than basic unauthorised access because it requires:',options:['That the unauthorised access caused financial damage exceeding £1,000','That the defendant intended to commit or facilitate a further criminal offence','That the defendant was acting as part of an organised criminal group'],correct:1},
    
      {q:'Under the Data Protection Act 1998, organisations that collect personal data are required to:',options:['Publish all data they hold about individuals on a public website within 30 days of collection','Ensure data is accurate, kept no longer than necessary, and protected with appropriate security measures','Delete all personal data automatically after one year unless the individual gives written consent to retain it'],correct:1},
      {q:'Under the DPA 1998, which body is responsible for enforcing data protection law and can issue enforcement notices?',options:['The Home Office — as the government department responsible for policing and security','The Information Commissioner\'s Office (ICO) — the independent supervisory authority for data protection','The National Crime Agency — as data breaches often involve criminal activity'],correct:1},
      {q:'Which of the eight DPA 1998 principles requires organisations to implement appropriate technical and organisational security measures to protect personal data?',options:['The principle requiring that data is processed fairly and lawfully','The principle requiring that data is accurate and kept up to date','The principle requiring appropriate security measures to protect against unauthorised access to protect against unauthorised access or loss'],correct:2},
      {q:'An employee copies a commercial software program from work and installs it at home without a licence. Which Act makes this illegal?',options:['The Computer Misuse Act 1990 — because copying software is a form of unauthorised access','The Copyright Designs and Patents Act 1988 — because software is protected as a literary work and copying without a licence is an infringement','The Data Protection Act 1998 — because software may contain personal data belonging to the company'],correct:1},
      {q:'An employee copies proprietary software from their employer\'s system to a personal USB drive without permission. Which legislation is most directly applicable?',options:['DPA 1998 — copying data without consent breaches data protection principles','CMA 1990 — copying data without authorisation from an employer\'s system is an offence under the Computer Misuse Act','CDPA 1988 — commercial software is protected by copyright as a literary work; copying without permission is an infringement'],correct:2},
      {q:'What is the key difference between the basic and intermediate Computer Misuse Act offences?',options:['The basic offence only applies to computers used for business; the intermediate offence covers all computers','The intermediate offence requires the attacker to have intended to commit a further crime — such as fraud — at the time of the unauthorised access','The basic offence carries a fine; the intermediate offence automatically results in imprisonment'],correct:1},
    ]
  }
};


// ═══════════════════════════════════════════════════════════
// ENGINE INTEGRATION — Required global definitions
// ═══════════════════════════════════════════════════════════

// MODULE_LIST drives the queue builder in engine.js
// (replaces the original MODULE_LIST from the children's version)
if(typeof MODULE_LIST !== 'undefined'){
  MODULE_LIST.length = 0;
} else {
  var MODULE_LIST = [];
}
['packetAnalysis','encryptionAudit','sqlInjection','firewallReview','legalCompliance']
  .forEach(m => MODULE_LIST.push(m));

// getToolOptions: shuffle correct tool with 2 decoys
function getToolOptions(moduleId){
  const mod=MODULES[moduleId]; if(!mod) return [];
  const decoys=shuffle(mod.tools.decoys).slice(0,2);
  return shuffle([mod.tools.correct,...decoys]);
}

// DATA COLUMN DEFINITIONS — drive the card rendering in engine.js
var MODULE_COLUMNS = {
  packetAnalysis: [
    { key:'name',     label:'FLOW ID' },
    { key:'purpose',  label:'DESCRIPTION' },
    { key:'srcIP',    label:'SOURCE IP' },
    { key:'protocol', label:'PROTOCOL' },
    { key:'dstPort',  label:'DEST PORT' },
    { key:'rate',     label:'PACKET RATE' },
    { key:'flags',    label:'TCP FLAGS' },
  ],
  encryptionAudit: [
    { key:'name',       label:'SYSTEM' },
    { key:'purpose',    label:'DESCRIPTION' },
    { key:'algorithm',  label:'ALGORITHM' },
    { key:'keySize',    label:'KEY / OUTPUT' },
    { key:'useCase',    label:'USE CASE' },
    { key:'lastUpdated',label:'LAST UPDATED' },
  ],
  sqlInjection: [
    { key:'name',           label:'ENDPOINT' },
    { key:'inputField',     label:'INPUT FIELD' },
    { key:'submittedValue', label:'SUBMITTED VALUE' },
    { key:'responseCode',   label:'HTTP RESPONSE' },
  ],
  firewallReview: [
    { key:'name',        label:'CHANGE REQ' },
    { key:'purpose',     label:'DESCRIPTION' },
    { key:'protocol',    label:'PROTOCOL' },
    { key:'port',        label:'PORT(S)' },
    { key:'direction',   label:'DIRECTION' },
  ],
  legalCompliance: [
    { key:'name',        label:'INCIDENT ID' },
    { key:'purpose',     label:'SUMMARY' },
    { key:'legislation', label:'LEGISLATION' },
    { key:'section',     label:'SECTION / PRINCIPLE' },
  ],
};

// ACTION BUTTON DEFINITIONS — referenced by engine.js MODULE_ACTIONS
if(typeof MODULE_ACTIONS === 'undefined'){ var MODULE_ACTIONS = {}; }

MODULE_ACTIONS.packetAnalysis = [
  { id:'block',   label:'🚫 BLOCK SOURCE' },
  { id:'monitor', label:'👁 MONITOR & ALERT' },
  { id:'allow',   label:'✅ ALLOW FLOW' },
];
MODULE_ACTIONS.encryptionAudit = [
  { id:'replace',  label:'🔴 REPLACE URGENTLY' },
  { id:'schedule', label:'🟡 SCHEDULE REPLACEMENT' },
  { id:'maintain', label:'✅ MAINTAIN' },
];
MODULE_ACTIONS.sqlInjection = [
  { id:'block',       label:'🚫 BLOCK & ALERT DBA' },
  { id:'investigate', label:'🔍 FLAG FOR REVIEW' },
  { id:'allow',       label:'✅ ALLOW (LEGITIMATE)' },
];
MODULE_ACTIONS.firewallReview = [
  { id:'reject',   label:'🚫 REJECT' },
  { id:'escalate', label:'🟡 ESCALATE FOR REVIEW' },
  { id:'approve',  label:'✅ APPROVE' },
];
MODULE_ACTIONS.legalCompliance = [
  { id:'reportPolice', label:'🚨 NOTIFY POLICE' },
  { id:'reportICO',    label:'📋 REPORT TO ICO' },
  { id:'internal',     label:'📝 INTERNAL REVIEW' },
];


// ═══════════════════════════════════════════════════════════
// MODULE 6: SOCIAL ENGINEERING ANALYSIS
// Network security threats — human-factor attacks:
// phishing, spear-phishing, pretexting, vishing,
// baiting, CEO fraud (Business Email Compromise)
// ═══════════════════════════════════════════════════════════
MODULES.socialEngineering = {
  id: 'socialEngineering',
  name: 'SOCIAL ENGINEERING ANALYSIS',

  emailSender: ()=>pick(['awareness@secops.internal','security-alerts@company.net','hr-security@company.net','soc@cyberdefence.net']),
  emailSubject: ()=>pick(['Staff Reports: Suspicious Communications Require Triage','Security Awareness Alert: Potential Social Engineering Attempts','Reported Incidents: Human-Factor Attack Triage Required','SOC Alert: Suspicious Contact Attempts — Analyst Review Needed']),
  emailBody(){
    return 'Analyst,\n\nTechCorp\'s help desk logged several unusual contact attempts '
      +'in the days before the breach. We now believe the attacker used social engineering '
      +'to gather intelligence and access credentials before the technical phase of the attack began.\n\n'
      +'Identifying which contacts were part of the attack chain is critical — '
      +'it will determine whether staff disciplinary action is needed, '
      +'and whether we need to notify specific employees about potential credential compromise.\n\n'
      +'Load the Social Engineering Alert Triage tool.\n\n'
      +'Threat Intelligence — TechCorp IR';
  },
  diagnosticSummary:'Social engineering exploits human psychology. Attack types: phishing (deceptive email), spear-phishing (targeted personalised), vishing (phone), smishing (SMS), pretexting (fabricated scenario), baiting (physical or digital lure), tailgating (physical access), BEC (executive impersonation). Psychological levers: urgency, authority, scarcity, social proof. Universal defence: verify through a separate pre-established channel.',
  diagnosticQuestions:[
    {q:'What is social engineering in security',opts:['Manipulating people into revealing information or taking harmful actions','Designing systems that are intuitive for users','Hacking into social media platforms'],ok:0,hint:'Social engineering targets humans, not systems. One deceived employee can defeat perfect technical controls.'},
    {q:'What is phishing',opts:['A tool used by IT teams to test network security','An attack using deceptive communications to steal credentials','Software used to monitor employee internet activity'],ok:1,hint:'Phishing is the most common attack vector — cheap, scalable, exploits human trust.'},
    {q:'What is two-factor authentication',opts:['Requiring two separate administrators to approve a login','Logging in with two different passwords in sequence','Using two independent verification methods to confirm identity'],ok:2,hint:'2FA means stolen passwords alone are useless — the attacker also needs the second factor.'},
    {q:'What is vishing',opts:['A phishing attack conducted over the phone','A visual security check performed on site','Malware that records video using a device camera'],ok:0,hint:'The 2020 Twitter hack was accomplished primarily through vishing — no technical exploit needed.'},
    {q:'What makes spear-phishing more effective than generic',opts:['Spear-phishing uses physical mail instead of email','It is personalised with researched details about the target','Spear-phishing only targets government organisations'],ok:1,hint:'Generic phishing sends millions of identical emails. Spear-phishing researches and targets one person.'},
    {q:'Why is urgency effective as a manipulation technique',opts:['IT systems automatically prioritise urgent requests','Urgent requests receive legal priority over normal ones','It creates time pressure that prevents careful verification'],ok:2,hint:'Urgency is the attacker\'s primary weapon — stops the victim pausing to check or verify.'},
    {q:'What is pretexting',opts:['A fabricated scenario used to establish trust before requesting access','A backup plan used when the main attack fails','A scenario used for security awareness training'],ok:0,hint:'Pretexting is an invented backstory — \'I\'m from IT\' — to give credibility before requesting access.'},
    {q:'What is baiting in social engineering',opts:['Sending fake job offers to extract professional details','Leaving physical or digital lures to exploit human curiosity','Enticing staff with rewards to report security incidents'],ok:1,hint:'Most found USB drives get plugged in within minutes — baiting exploits curiosity reliably.'},
    {q:'What is tailgating in physical security',opts:['Monitoring social media activity of target employees','Following a vehicle approaching a secure facility','Gaining unauthorised physical access by following an authorised person'],ok:2,hint:'Tailgating exploits politeness — people hold doors. Turnstiles and a challenge culture are the fix.'},
    {q:'What is BEC — Business Email Compromise',opts:['Fraud where attackers impersonate executives to authorise transfers','A bug in business email software allowing unauthorised access','Blocking business email to extort a ransom payment'],ok:0,hint:'BEC causes billions in annual losses. Finance teams are the primary target.'},
    {q:'Why should you never share a password with IT',opts:['IT staff are not authorised to hold passwords at all','Legitimate IT staff don\'t need your password — they have admin access','Passwords are encrypted so IT cannot read them anyway'],ok:1,hint:'Any request for your password is either unnecessary (legitimate IT) or malicious (attacker).'},
    {q:'What is a lookalike domain',opts:['A domain that resolves to two different IP addresses','A domain registered in a different country','A fraudulent domain designed to look like a legitimate one'],ok:2,hint:'paypa1.com, paypal.co — subtle differences designed to deceive at a glance.'},
    {q:'What is smishing',opts:['A phishing attack delivered via SMS text messages','A physical access attack using a friendly approach','A social engineering attack via social media'],ok:0,hint:'Smishing exploits the higher trust people place in text messages compared to email.'},
    {q:'What is social proof as a manipulation technique',opts:['Evidence gathered from a target\'s social media profiles','Implying others have already complied to pressure the target','Verifying a person\'s identity through their social profiles'],ok:1,hint:'\'Everyone else on your team has done this already.\' Exploits the urge to follow what others do.'},
    {q:'The best defence against social engineering is',opts:['Blocking all external calls and email communication','Advanced endpoint antivirus on all company devices','Security awareness training with clear verification procedures'],ok:2,hint:'Technical controls cannot defend against human manipulation — awareness and culture are the only answer.'},
    {q:'What is multi-factor authentication',opts:['Using two or more verification factors to confirm identity','Requiring multiple users to approve each login','Changing your password multiple times per month'],ok:0,hint:'MFA defeats credential theft — a stolen password is useless without the second factor.'},
    {q:'What is CEO fraud',opts:['An executive accidentally deleting critical business data','Attackers impersonating executives to pressure staff into transfers','A CEO committing insider trading using company systems'],ok:1,hint:'CEO fraud exploits authority bias. Fix: dual authorisation and verbal confirmation on a known number.'},
    {q:'Why must you verify through a separate channel',opts:['It creates a formal audit trail for compliance purposes','The original channel may be monitored by third parties','The attacker may have compromised the original channel'],ok:2,hint:'If someone is impersonating your colleague by email, verifying by email is useless. Call a known number.'},
    {q:'What does authority mean as a social engineering lever',opts:['Exploiting the tendency to comply with perceived authority figures','The legal right to demand compliance from others','The technical expertise displayed to gain a target\'s trust'],ok:0,hint:'Attackers impersonate executives, IT staff, auditors, regulators — all exploit authority bias.'},
    {q:'Why is it important to have a clear policy about how staff can verify the identity of callers claiming to be from IT support',opts:['So that IT staff can charge for support calls that take more than 30 minutes','Without a verification process, an attacker can impersonate IT and obtain passwords or system access through deception alone','So that support calls can be recorded for training purposes without needing consent'],ok:1,hint:'Social engineering exploits trust — a verification procedure forces callers to prove who they are before any sensitive action is taken.'}
  ],
  tools: {
    correct: 'Social Engineering Alert Triage',
    decoys: ['Packet Capture Analyser','Encryption Audit Tool','SQL Query Log Viewer','Firewall Rule Manager','Legal Reference Database','Endpoint Security Log Viewer','Email Header Analyser']
  },

  briefing: {
    title: 'Social Engineering Analysis',
    tagline: 'Identifying human-factor attacks that bypass technical controls',
    summary: "Social engineering attacks target people rather than systems. They exploit psychological principles: authority (the request comes from someone senior), urgency (act now or face consequences), scarcity (limited time window), social proof (others have already done this), and reciprocity. Phishing uses email; spear-phishing is personalised to the target; vishing uses phone calls; smishing uses SMS. Pretexting builds a fabricated scenario to establish trust. Baiting uses physical media or digital lures. CEO fraud (Business Email Compromise) impersonates executives to authorise fraudulent payments. The defence is always verification through a separate, pre-established channel — not the one the attacker is using.",
    watchFor: 'Requests for credentials, passwords or MFA codes — no legitimate IT team will ask for these • Unusual urgency: "act now or your account will be deleted" • Requests to bypass normal processes or keep the contact secret • Claimed identities that cannot be independently verified • Any request for financial transfers outside normal procurement channels • Unexpected physical access requests to secure areas',
    realWorld: "In 2020, attackers called Twitter's internal IT support, impersonated employees, and convinced staff to hand over admin credentials. Within hours they had compromised 130 high-profile accounts including Barack Obama, Elon Musk and Apple, posting a Bitcoin scam that generated $120,000 in two hours. No malware was used. The entire attack was a phone call."
  },

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — clear social engineering attacks
      {
        name:'SE-001', purpose:'Phone call to IT help desk claiming urgent account issue',
        channel:'Phone', claimedIdentity:'IT caller — claims senior manager', asks:'Password reset + MFA disabled', redflag:'Urgency, MFA bypass, voice-only', request:'Caller asks IT to reset password and disable MFA — claims locked out before board meeting',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Classic vishing attack. Legitimate users reset passwords through self-service portals with identity verification. Requests to disable MFA over the phone are never legitimate. The claimed urgency (board meeting) is a pressure tactic. Block and report.'
      },
      {
        name:'SE-002', purpose:'Email asking for emergency bank transfer',
        channel:'Email', claimedIdentity:'CEO (lookalike domain: ceo-company.net)', asks:'Transfer £18,500 to new supplier urgently', redflag:'Lookalike domain, secrecy, urgency', request:'Asks Finance to transfer £18,500 — urgently and confidentially, before the board sees it',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Business Email Compromise (CEO fraud). The domain is a lookalike — ceo-company.net vs company.com. The combination of financial request, urgency and secrecy ("before the board sees it") are the classic BEC triad. Verify all bank transfer requests by calling the requestor directly on a known number.'
      },
      {
        name:'SE-003', purpose:'Spear-phishing email referencing real internal project',
        channel:'Email', claimedIdentity:'IT Security (company-support.co.uk)', asks:'Click link to re-authenticate to SharePoint', redflag:'External domain, project name used as lure', request:'References Project Meridian by name, requests re-authentication via link to new SharePoint',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Spear-phishing: the attacker has researched the company and used a real project name to build credibility. The sender domain (company-support.co.uk) is not the company\'s actual domain. The link leads to a credential-harvesting page. The personalisation is the attack — it makes it feel legitimate.'
      },
      {
        name:'SE-004', purpose:'USB drive left in company car park',
        channel:'Physical', claimedIdentity:'Unknown (labelled Salary Review USB)', asks:'(None — employee plugged it in)', redflag:'Physical media, curiosity/self-interest lure', request:'Multiple drives found in car park. Employee plugged one in to identify the owner.',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Baiting attack: the label exploits curiosity and self-interest. Once plugged in, the drive executes a payload automatically or prompts the user to enable macros. Isolate the affected workstation immediately. Never plug unknown media into a work device — the "I just wanted to return it" instinct is the attack vector.'
      },
      {
        name:'SE-005', purpose:'Contractor requesting server room access without prior arrangement',
        channel:'Physical', claimedIdentity:'Halon Systems Ltd contractor (unbooked)', asks:'Server room access for fire inspection', redflag:'No appointment, unescorted, unverified', request:'Unannounced arrival, requests server room access for fire safety inspection, shows business card',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Pretexting with physical tailgating attempt. The scenario creates a plausible cover (fire safety) but no appointment exists and no company badge verification is possible. Legitimate contractors are always pre-booked, escorted and signed in. Deny access, ask them to rebook through Facilities.'
      },
      {
        name:'SE-006', purpose:'LinkedIn message requesting internal technical details',
        channel:'Social Media', claimedIdentity:'Competitor recruiter (profile: 2 weeks old)', asks:'Share infrastructure technical details', redflag:'New account, unsolicited, intel gathering', request:'Asks about technical pain points with current infrastructure, offers referral bonus for information',
        ragAnswer:'R', actionAnswer:'block',
        notes:'Competitive intelligence gathering / corporate espionage. The new account, unsolicited contact and requests for internal technical detail are the indicators. This is social engineering even without a technical payload — sharing internal infrastructure details aids targeted attacks.'
      },
      // AMBER — suspicious, verify before proceeding
      {
        name:'SE-007', purpose:'Email from "Microsoft" about Azure account suspension',
        channel:'Email', claimedIdentity:'Microsoft Azure (microsoft-cloud-support.com)', asks:'Login via link to update billing details', redflag:'Suspicious domain — not microsoft.com', request:'Azure subscription suspended in 48h due to billing issue — requests login to update payment',
        ragAnswer:'A', actionAnswer:'verify',
        notes:'The sender domain is suspicious (microsoft-cloud-support.com, not microsoft.com) but the message content is plausible. The company does use Azure. Verify directly by logging into portal.azure.com — never via the link in this email. Could be phishing or could be a legitimate notification routed through a third-party billing service.'
      },
      {
        name:'SE-008', purpose:'Help desk ticket asking to whitelist a new software tool',
        channel:'Internal ticketing system', claimedIdentity:'Development team lead (ticketing system)', asks:'Whitelist new open-source analysis tool', redflag:'Verify: external tool needs security review', request:'Via official ticketing system: whitelist a new open-source dependency analysis tool',
        ragAnswer:'A', actionAnswer:'verify',
        notes:'Submitted through the correct channel (internal ticketing), which reduces risk. However, whitelisting external tools creates a potential supply chain risk. Verify the request is genuine with the development manager, and check whether the tool has been security-reviewed. Not a clear attack but verification is warranted.'
      },
      {
        name:'SE-009', purpose:'SMS claiming to be from company IT about an urgent system alert',
        channel:'SMS', claimedIdentity:'IT Support (unknown SMS number)', asks:'Reply YES or call to freeze account', redflag:'SMS channel, unknown number, urgency', request:'URGENT: Your work account has been compromised. Reply YES to freeze it or call 0800 XXX XXXX',
        ragAnswer:'A', actionAnswer:'verify',
        notes:'Smishing (SMS phishing). Company IT does not send account alerts via personal SMS or use freephone numbers for security issues. However, an actual breach notification would also be unusual. Do not reply or call the number — contact IT support through the official internal number instead.'
      },
      // GREEN — legitimate, no action needed
      {
        name:'SE-010', purpose:'Password reset email from company IT portal',
        channel:'Email', claimedIdentity:'IT Help Desk (helpdesk@company.com)', asks:'Reset via internal portal (intranet link)', redflag:'None — company domain, internal portal', request:'Standard password expiry notification linking to internal self-service portal (intranet.company.com)',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Legitimate: correct internal domain, links to the company intranet (not an external site), standard process, no urgency or unusual request. Password expiry notifications from the internal domain with internal portal links are expected. No social engineering indicators.'
      },
      {
        name:'SE-011', purpose:'Procurement: new supplier onboarding form',
        channel:'Email via official procurement system', claimedIdentity:'Procurement (procurement@company.com)', asks:'Complete supplier due diligence forms', redflag:'None — official system, reference number', request:'Automated procurement system notification: complete standard supplier due diligence forms',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Legitimate business process. Sent from the correct internal domain via the official procurement system with a reference number. No requests for credentials or out-of-process payments. This is normal supplier onboarding.'
      },
      {
        name:'SE-012', purpose:'Fire safety inspection — pre-booked visit',
        channel:'Email confirmation + Reception log', claimedIdentity:'Facilities Management + verified contractor', asks:'Annual fire system inspection access', redflag:'None — pre-booked, ID verified, escorted', request:'Pre-booked annual fire inspection, confirmed 3 weeks ago, contractor verified with photo ID and escorted',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Legitimate: appointment pre-booked in advance, contractor verified with photo ID, escorted throughout. This is precisely the process that SE-005 (the pretexting attack) was trying to bypass. The contrast is the point — process compliance is the defence.'
      },
    ];
    // Adaptive difficulty — set by Analyst Pre-Brief diagnostic score
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION: mostly clear RED/GREEN, light AMBER
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED: more AMBER ambiguity, still varied
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD: balanced mix
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}  // always ≥1 GREEN
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  reportTeams:{ correct:'Security Awareness & HR Department', incorrect:'Network Operations Centre' },
  reportHint: 'Social engineering attacks exploit people — which team handles human-factor security and staff incidents?',

  completionText(_,sc){
    const att=sc.filter(s=>s.ragAnswer!=='G').length;
    return `<div class="rc info">
      <div style="font-family:'Orbitron',monospace;font-size:11px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — SOCIAL ENGINEERING ANALYSIS</div>
      <p style="margin-bottom:8px;"><strong>${att} suspicious contact(s)</strong> identified in the pre-breach window. ${att>0?'This confirms the attacker ran a social engineering phase before the technical attack — gathering credentials, access, and internal knowledge that made the later technical exploitation much easier.':'The suspicious contacts appear to be unrelated to the breach, but demonstrate the kind of targeting TechCorp faces.'}</p>
      <hr style="border-color:rgba(0,255,65,.15);margin:10px 0;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:rgba(0,255,65,.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: SOCIAL ENGINEERING & NETWORK THREATS</div>
      <p style="font-size:12px;line-height:1.6;">Examiners expect you to: <strong>name and distinguish attack types</strong> (phishing/spear-phishing/vishing/smishing/pretexting/baiting/BEC), <strong>identify psychological techniques</strong> (urgency, authority, scarcity, reciprocity), <strong>explain defences</strong> (security awareness training, verification procedures). A common 2-mark question: "Give two features of a spear-phishing email that make it more effective than generic phishing." Answer: personalised to target (1 mark) using researched details such as real colleague names or project references (1 mark).</p>
    </div>`;
  },

  actions:{ R:'block', A:'verify', G:'allow' },
  actionLabels:{ block:'🚫 BLOCK & REPORT', verify:'🔍 VERIFY INDEPENDENTLY', allow:'✅ LEGITIMATE' },
  ragRules:{
    R:'Clear social engineering: requests credentials, bypasses process, impersonates authority → BLOCK & REPORT',
    A:'Suspicious but unconfirmed: unusual channel or request → VERIFY through separate channel',
    G:'Follows correct process through correct channel → LEGITIMATE',
  },

  plenary:{
    reportHint: 'Social engineering attacks exploit people — which team handles human-factor security and staff incidents?',
    analogy: 'A social engineering attack is like a con artist who does not pick the lock — they convince the security guard to open the door. All the technical security in the world is bypassed the moment someone hands over their credentials on the phone.',
    whatHappened: 'A mix of attack types targeted staff: vishing, BEC/CEO fraud, spear-phishing, physical baiting and pretexting — all using psychological pressure (urgency, authority, secrecy) rather than exploiting technical vulnerabilities. Some legitimate communications were also present, requiring careful distinction.',
    keyMove: 'Verify through a separate channel you control (call the person on a known number, log in directly via a known URL). Urgency + secrecy + unusual request = attack profile. Legitimate IT teams never ask for passwords or MFA codes. Process compliance — pre-booked, verified, escorted — is the physical access defence.',
    realWorld: "The 2020 Twitter hack compromised 130 accounts of world leaders and public figures using only phone calls to Twitter's internal support. No zero-day exploits. No malware. Just a convincing voice on the phone asking the right questions. Over $120,000 was transferred to attackers before Twitter locked all verified accounts.",
    quiz:[
      {q:'Spear-phishing differs from generic phishing in that it:',options:['Uses a phone call rather than an email as the attack vector','Is specifically targeted at an individual or organisation, using researched personal details to appear credible','Involves physically delivering a USB drive or device to the target'],correct:1},
      {q:'Pretexting is best described as:',options:['Sending a large volume of phishing emails hoping some recipients will click','Creating a fabricated but plausible scenario to establish trust and extract information or access','Exploiting a known software vulnerability to gain unauthorised access'],correct:1},
      {q:'Which psychological principle does "Your account will be permanently deleted unless you verify within 24 hours" primarily exploit?',options:['Social proof — most people have already verified their account','Urgency and scarcity — creating time pressure that overrides careful thinking','Reciprocity — the user owes the company their cooperation'],correct:1},
      {q:'Business Email Compromise (BEC/CEO fraud) attacks typically involve:',options:['Injecting malicious code into the company email server','Impersonating a senior executive to authorise fraudulent financial transfers, often using a lookalike domain','Intercepting emails in transit using a man-in-the-middle attack'],correct:1},
      {q:'A caller claims to be from IT support and asks for your password to fix a login issue. The correct response is:',options:['Give the password — IT support are authorised to access all accounts','Refuse — no legitimate IT team will ever ask for a user\'s password','Ask the caller to email the request first, then provide the password by email'],correct:1},
      {q:'Baiting attacks exploit:',options:['Unpatched software vulnerabilities in operating system drivers','Human curiosity or self-interest — e.g. picking up and plugging in a labelled USB drive found in the car park','Weak passwords that can be guessed by an automated tool'],correct:1},
      {q:'The most effective technical and procedural defence against social engineering is:',options:['Installing endpoint antivirus software on all workstations','Blocking all inbound email attachments at the mail gateway','Security awareness training combined with verification procedures — all unusual requests confirmed through a separate, known channel'],correct:2},
      {q:'Vishing uses which attack channel?',options:['Fraudulent emails designed to look like legitimate communications','Voice calls — phone-based social engineering using a plausible pretext','SMS messages containing malicious links or fraudulent instructions'],correct:1},
      {q:'An attacker who follows an authorised employee through a secure door without using their own credentials is performing:',options:['Pretexting — using a fabricated scenario to justify their presence','Tailgating — exploiting courtesy to gain unauthorised physical access','Vishing — the door entry system uses a PIN (voice interaction)'],correct:1},
    
      {q:'What is smishing?',options:['A form of phishing that uses social media messages to deliver malicious links','A phishing attack delivered via SMS text messages','A physical tailgating attack where the attacker "smiles" their way past security'],correct:1},
      {q:'Why does spear-phishing succeed more often than generic phishing?',options:['Spear-phishing emails always contain malware attachments; generic phishing relies only on links','Spear-phishing is personalised using researched details (real names, project references, job titles), making it appear more credible and reducing the victim\'s suspicion','Spear-phishing exploits software vulnerabilities; generic phishing relies on social manipulation alone'],correct:1},
      {q:'Why is verifying a caller through a separate, pre-established channel the most reliable response to a vishing attempt?',options:['Because the original channel is always unencrypted and therefore untrustworthy','Because the attacker may have compromised or be impersonating the original channel — a separate contact route breaks the deception entirely','Because regulatory compliance requires all security responses to be logged through independent channels'],correct:1},
      {q:'An attacker calls a receptionist pretending to be from the fire safety inspection company and requests immediate server room access. What type of attack is this?',options:['Vishing — the attack uses a voice call to obtain information or access','Pretexting — a fabricated but plausible scenario designed to gain trust and physical access','Baiting — using the promise of something desirable to lure the victim'],correct:1},
      {q:'What is tailgating in physical security?',options:['Following a legitimate employee through a secure door without using your own credentials','Reading over someone\'s shoulder to obtain their password or PIN','Installing tracking software on a victim\'s device to monitor their location'],correct:0},
      {q:'What makes Business Email Compromise (BEC) particularly difficult to detect compared to generic phishing?',options:['BEC always uses malware that encrypts emails before delivery, bypassing spam filters','The attacker impersonates a trusted senior figure using a convincing domain, exploits authority and urgency, and requires no malware — it is entirely social','BEC requires the attacker to have physical access to the executive computer to intercept emails'],correct:1},
    ]
  }
};


// ═══════════════════════════════════════════════════════════
// MODULE 7: MALWARE BEHAVIOUR ANALYSIS
// Network security threats — malware types and behaviour:
// ransomware, trojans, keyloggers, worms, spyware, rootkits
// ═══════════════════════════════════════════════════════════
MODULES.malwareAnalysis = {
  id: 'malwareAnalysis',
  name: 'MALWARE BEHAVIOUR ANALYSIS',

  emailSender: ()=>pick(['edr@secops.internal','endpoint@infrasec.net','soc-alerts@company.net','threat-intel@cyberdefence.net']),
  emailSubject: ()=>pick(['Security Alert: Anomalous Program Behaviour Detected','Endpoint Security: Suspicious Activity Requires Triage','SOC Alert: Potential Malware Indicators on Workstations','Threat Detection: Endpoint Behaviour Review Required']),
  emailBody(){
    return 'Analyst,\n\nPost-breach, TechCorp\'s endpoint security software is flagging unusual program behaviour '
      +'across multiple workstations. The attacker may still have persistent access.\n\n'
      +'TIME-CRITICAL: if ransomware deploys while we\'re investigating, '
      +'TechCorp\'s payment processing stops entirely — 500,000 customers affected, '
      +'potential losses in the tens of thousands per hour.\n\n'
      +'Any confirmed malware means immediate host isolation. '
      +'Load the Endpoint Security Log Viewer and work through each flagged program.\n\n'
      +'Incident Response Lead — TechCorp IR';
  },
  diagnosticSummary:'Malware types: virus attaches to files and needs user action to spread. Worm self-replicates across networks without user action. Trojan is disguised as legitimate software. Ransomware encrypts files and demands payment. Keylogger captures keystrokes. Spyware exfiltrates data silently. Rootkit hides other malware. Indicators of Compromise include suspicious process paths, unexpected network connections and abnormal CPU or disk activity.',
  diagnosticQuestions:[
    {q:'What is malware',opts:['Software designed to disrupt, damage or gain unauthorised access','Poorly written software that causes crashes','A tool used by professionals to test systems'],ok:0,hint:'Malware covers viruses, worms, trojans, ransomware, spyware and keyloggers.'},
    {q:'What distinguishes a worm from a virus',opts:['A worm self-replicates across a network without user action','Worms encrypt files while viruses only replicate','A worm only affects email servers'],ok:0,hint:'Worms spread automatically — no user has to click anything.'},
    {q:'What is a trojan horse in computing',opts:['A virus targeting only older systems','An ancient technique for bypassing physical security','Malware disguised as legitimate software to trick users into installing it'],ok:2,hint:'Trojans rely on the user installing them willingly.'},
    {q:'What is ransomware',opts:['Malware that encrypts files and demands payment for the decryption key','Software that locks a screen until a puzzle is solved','Adware that replaces websites with fake ones'],ok:0,hint:'Ransomware brings operations to a halt by making all files inaccessible.'},
    {q:'What is a keylogger',opts:['Software that monitors who logs in','Malware that records keystrokes to capture passwords and data','Hardware used to test keyboard function'],ok:1,hint:'Keyloggers silently capture everything typed and send it to the attacker.'},
    {q:'What does spyware do',opts:['It displays adverts inside legitimate websites','It covertly collects information about the user and sends it externally','It spreads automatically to other devices on the network'],ok:1,hint:'Spyware operates silently — victims often have no idea it is running.'},
    {q:'What is adware',opts:['Software that deletes advertising cookies','Unwanted software that displays adverts and may collect browsing data','A type of virus that spreads through email attachments'],ok:1,hint:'Adware is at the less harmful end of the malware spectrum but can still collect data.'},
    {q:'What is a trojan horse and why is it dangerous compared to other malware',opts:['A trojan is rare because it requires specialist programming skills to create','Because the user installs it willingly believing it is legitimate software, it can be very difficult to prevent using technical controls alone','A trojan can only infect a device if the user opens a malicious email attachment'],ok:1,hint:'Trojans rely on deception rather than technical exploits — this makes user education particularly important as a defence.'},
    {q:'What type of malware displays unwanted adverts and may collect data about browsing habits',opts:['Ransomware — which encrypts files and demands payment','Adware — software that generates revenue for the attacker through adverts and data collection','A worm — which spreads automatically to other devices on the network'],ok:1,hint:'Adware is at the less harmful end of the malware spectrum but still represents a privacy risk — browsing data is valuable to advertisers.'},
    {q:'What is spyware and what is its goal',opts:['Software that monitors system performance and reports it to the manufacturer for quality improvement','Malicious software that secretly collects information about a user — such as browsing habits, credentials or personal data — and sends it to the attacker','Software that protects a device by monitoring for unusual activity and alerting the user'],ok:1,hint:'Spyware operates silently over time — victims often have no idea their data is being collected until credentials are misused.'},
    {q:'What is a virus in computing',opts:['Any malicious software on a computer','Malware that attaches to legitimate files and spreads when those files are shared or run','Software that monitors network traffic for threats'],ok:1,hint:'Viruses need a host file and spread through human action such as sharing infected programs.'},
    {q:'How does antivirus software detect known malware',opts:['By checking if software was purchased from a legitimate store','By comparing file patterns against a database of known malware signatures','By monitoring how fast a program uses CPU'],ok:1,hint:'Signature-based detection is fast but cannot identify new malware not yet in the database.'},
    {q:'What is the main risk of ransomware to an organisation',opts:['It permanently deletes all files making recovery impossible','It encrypts files making them unusable until a decryption key is provided often in exchange for payment','It spreads to customer systems and causes reputational damage'],ok:1,hint:'Ransomware brings operations to a halt — backup and patch hygiene are the primary defences.'},
    {q:'What does a trojan horse rely on to infect a device',opts:['An unpatched software vulnerability','The user choosing to install it while believing it is something legitimate','An active network connection to spread between devices'],ok:1,hint:'Unlike viruses or worms, trojans depend entirely on the user taking an action.'},
    {q:'Which type of malware specifically records keyboard input',opts:['Ransomware','A keylogger','A worm'],ok:1,hint:'Keyloggers are a type of spyware focused specifically on capturing what you type — passwords, messages, and other input.'},
    {q:'What is social engineering in the context of malware delivery',opts:['Using social media platforms to spread malware links automatically','Manipulating people into taking an action that installs malware such as clicking a link or opening an attachment','Exploiting software vulnerabilities in social media applications'],ok:1,hint:'Most malware infections begin with social engineering — tricking a human is often easier than exploiting code.'},
    {q:'A worm differs from a virus because',opts:['A worm always encrypts files while a virus never does','A worm self-propagates across a network without requiring human action','A worm only infects removable drives while a virus spreads over the internet'],ok:1,hint:'Viruses need user action; worms spread autonomously — a key exam distinction.'},
    {q:'What does it mean for malware to achieve persistence',opts:['The malware encrypts itself differently each time it runs','The malware can survive a device restart and continues to run automatically','The malware has infected more than 100 devices on the network'],ok:1,hint:'Persistent malware sets up startup entries or scheduled tasks so it relaunches after every reboot.'},
    {q:'What is adware and how does it differ from other malware types',opts:['Adware encrypts advertising data to prevent competitors accessing it','Adware displays unwanted adverts and may collect browsing data — it is generally less harmful than viruses or ransomware but still unwanted','Adware is a type of ransomware that locks the screen until the user clicks on an advert'],ok:1,hint:'Adware is commercially motivated — the attacker profits from ad revenue or data sales. It sits at the lower-risk end of the malware spectrum.'},
,
    {q:'Which malware type both encrypts data AND demands money to restore it',opts:['A trojan — because it disguises itself as legitimate software','Ransomware — because it encrypts files and demands payment for the decryption key','Spyware — because it collects and sells personal data for profit'],ok:1,hint:'Ransomware combines encryption with extortion — the WannaCry attack in 2017 disrupted the NHS.'},
  ],

  tools: {
    correct: 'Endpoint Security Log Viewer',
    decoys: ['Packet Capture Analyser','SQL Query Log Viewer','Firewall Rule Manager'],
  },

  generateScenario({numItems=6,difficulty=1}={}){
    const pool = [
      // RED — clear malware threats (on-spec types: ransomware, worm, trojan, spyware, virus, keylogger)
      {
        name:'ransomware.exe', purpose:'Ransomware encrypting all user files',
        source:'Arrived via phishing email attachment', activity:'Mass file encryption — all documents renamed with .locked extension',
        network:'Single DNS query then no network activity',
        ragAnswer:'R', actionAnswer:'quarantine',
        notes:'Ransomware behaviour is unmistakable: mass file writes in a short window, extension changes, and a ransom note on the desktop. Isolate the host immediately to prevent spread. Do not pay the ransom — it does not guarantee recovery.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Legal Department'},
      },
      {
        name:'keylogger.exe', purpose:'Spyware capturing keystrokes and sending them externally',
        source:'Bundled with a pirated software download', activity:'Records all keyboard input, sends data every 5 minutes to external server',
        network:'Regular small outbound connections every 300 seconds',
        ragAnswer:'R', actionAnswer:'quarantine',
        notes:'Keyloggers are a type of spyware. The regular 5-minute outbound pattern is a strong indicator — legitimate software does not phone home on a fixed schedule. Any captured credentials must be treated as compromised and changed immediately.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Facilities Management'},
      },
      {
        name:'network_worm.exe', purpose:'Worm spreading copies of itself to other devices on the network',
        source:'Entered via unpatched vulnerability on one workstation', activity:'Scanning internal network, writing copies to 14 other devices',
        network:'High volume of connections to multiple internal IPs',
        ragAnswer:'R', actionAnswer:'isolate',
        notes:'Worm behaviour is defined by self-replication without user action. The spread to 14 other devices means containment must happen immediately. Isolate all affected hosts — not just the source — and patch the vulnerability used to enter.',
        reportTeams:{correct:'Incident Response Team',incorrect:'HR Department'},
      },
      {
        name:'trojan_remote.exe', purpose:'Trojan installed via fake video player — giving attacker remote control',
        source:'Downloaded by user as free_videoplayer_setup.exe', activity:'Maintaining persistent encrypted connection to external server, receiving commands',
        network:'Persistent outbound encrypted connection, receiving inbound data',
        ragAnswer:'R', actionAnswer:'quarantine',
        notes:'This is a Remote Access Trojan (RAT). The persistent connection to an external server means an attacker has live control of this machine. All activity since installation must be treated as compromised — the attacker has had full access to everything the user can see.',
        reportTeams:{correct:'Incident Response Team',incorrect:'IT Helpdesk'},
      },
      {
        name:'spyware_browser.exe', purpose:'Spyware collecting browsing history and saved passwords',
        source:'Installed alongside a free browser extension', activity:'Reading browser storage, uploading data to external server every 30 minutes',
        network:'Regular uploads to 194.x.x.x every 1800 seconds',
        ragAnswer:'R', actionAnswer:'quarantine',
        notes:'Spyware collects data silently over time. Saved passwords and browsing history represent a serious data breach — assume all credentials stored in the browser have been captured. Reset all passwords and check for unauthorised account access.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Payroll Department'},
      },
      {
        name:'virus_infector.exe', purpose:'Virus attaching copies of itself to other programs on the device',
        source:'Opened in an infected file received from an external contact', activity:'Reading and modifying .exe files on the device — 42 files affected',
        network:'No network activity — local spread only',
        ragAnswer:'R', actionAnswer:'quarantine',
        notes:'A virus embeds itself in legitimate files so that anyone running those files also becomes infected. 42 modified executables means the infection is widespread across this device. All affected files must be cleaned or replaced from trusted backups.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Marketing Team'},
      },
      // AMBER — potentially unwanted or ambiguous behaviour
      {
        name:'adware_toolbar.exe', purpose:'Adware installed alongside free software — displaying adverts',
        source:'Bundled with free_game_installer.exe without clear disclosure', activity:'Browser homepage changed, adverts injected, browsing data sent externally',
        network:'Outbound browsing data uploads — domain not categorised as malicious',
        ragAnswer:'A', actionAnswer:'investigate',
        notes:'Adware sits in a grey area — it may technically be covered by buried terms and conditions. However, the collection and transmission of browsing data without explicit consent raises data protection concerns. Investigate whether consent was given and whether removal is appropriate.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Catering Services'},
      },
      {
        name:'macro_runner.exe', purpose:'Macro executing from a document received by email',
        source:'Opened from email attachment Invoice_March.docx', activity:'Script execution, outbound connection to download additional content',
        network:'Single outbound connection to unknown URL on execution',
        ragAnswer:'A', actionAnswer:'investigate',
        notes:'Macros in email attachments are a common malware delivery method. This one made a network connection immediately on opening — consistent with a dropper downloading a second stage payload. Investigate whether the download was blocked and what the macro attempted to do.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Procurement Team'},
      },
      {
        name:'unverified_update.exe', purpose:'Software update from an unsigned, unverified publisher',
        source:'Prompted by a pop-up while browsing — not from the official software vendor', activity:'Installing software package, modifying application files',
        network:'Downloaded from non-official domain — not vendor CDN',
        ragAnswer:'A', actionAnswer:'investigate',
        notes:'Legitimate software updates are digitally signed by the vendor. An unsigned update from a non-official domain could be a fake update used to deliver malware. Investigate the source and compare against the official vendor release notes before allowing.',
        reportTeams:{correct:'Incident Response Team',incorrect:'Building Management'},
      },
      // GREEN — legitimate system processes
      {
        name:'MsMpEng.exe', purpose:'Windows Defender antivirus running its scheduled weekly scan',
        source:'Built-in Windows security software', activity:'Scanning all files on system drive for known malware signatures',
        network:'No network activity during local scan',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'MsMpEng.exe is the Windows Defender scanning engine. High CPU usage during a scan is entirely normal. The lack of network activity confirms this is a local scan rather than an update download. No action required.',
        reportTeams:{correct:'IT Support Team',incorrect:'Incident Response Team'},
      },
      {
        name:'wuauclt.exe', purpose:'Windows Update downloading this month security patches from Microsoft',
        source:'Automatic Windows Update process', activity:'Downloading patch files from Microsoft update servers',
        network:'Outbound downloads from Microsoft CDN — verified addresses',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Windows Update activity is expected and desirable — security patches protect against known vulnerabilities. The Microsoft CDN addresses are well-known and the file sizes match published patch manifests. Blocking this would leave the system unpatched.',
        reportTeams:{correct:'IT Support Team',incorrect:'Incident Response Team'},
      },
      {
        name:'VeeamAgent.exe', purpose:'Veeam backup software copying files to the company backup server',
        source:'Company-approved backup software deployed by IT', activity:'Reading all files on system drive, writing to backup server at 192.168.10.50',
        network:'Outbound file transfers to company backup server',
        ragAnswer:'G', actionAnswer:'allow',
        notes:'Backup software must read all files to create a complete backup — high file-read activity is normal and expected. The destination is the internal backup server IP, verified against the IT asset register. This activity coincides with the scheduled Sunday 02:00 backup job.',
        reportTeams:{correct:'IT Support Team',incorrect:'Incident Response Team'},
      },
    ];
    var nR,nA,nG;
    if(difficulty===0){           // FOUNDATION
      nR=pick([2,3]); nA=pick([0,1]); nG=numItems-nR-nA;
    } else if(difficulty===2){    // ADVANCED
      nR=pick([2,2,3]); nA=pick([1,2,2]); nG=numItems-nR-nA;
    } else {                      // STANDARD
      nR=pick([2,2,3]); nA=pick([1,1,2]); nG=numItems-nR-nA;
    }
    if(nG<1){nG=1;nA=Math.max(0,numItems-nR-nG);}
    return _pickPool(pool,nR,nA,Math.max(1,nG));
  },

  completionText(_,sc){
    const threats=sc.filter(s=>s.ragAnswer==='R').length;
    return `<div class="rc info">
      <div style="font-family:var(--font-display);font-size:11px;color:rgba(var(--accent-rgb),.5);letter-spacing:.1em;margin-bottom:8px;">📁 TECHCORP IR — ENDPOINT SECURITY</div>
      <p style="margin-bottom:8px;"><strong>${threats} confirmed malware threat(s)</strong> in this endpoint sample.
      ${threats>0?'Affected hosts must be isolated and reimaged before being returned to service. All credentials on affected systems should be treated as compromised.':'No confirmed threats in this sample — the suspicious items identified may warrant further investigation by the security team.'}</p>
      <hr style="border:none;border-top:1px solid rgba(var(--accent-rgb),.15);margin:10px 0;">
      <div style="font-family:var(--font-display);font-size:10px;color:rgba(var(--accent-rgb),.5);letter-spacing:.1em;margin-bottom:6px;">📝 EXAM FOCUS: MALWARE TYPES</div>
      <p style="font-size:12px;line-height:1.6;">Key definitions: <strong>Virus</strong> — needs a host file and user action to spread. <strong>Worm</strong> — self-replicates across a network without user action. <strong>Trojan</strong> — disguised as legitimate software. <strong>Ransomware</strong> — encrypts files and demands payment. <strong>Spyware/Keylogger</strong> — collects and exfiltrates data.</p>
      </div>`;
  },

  plenary:{
    reportHint: 'Active malware on a company device is a live security incident — which team handles containment and recovery?',
    analogy: 'Reviewing endpoint logs is like reviewing CCTV footage after a break-in. Most activity is routine — the backup running at 2am, the antivirus scan on Sunday. But some activity stands out: a process running at 3am that has never appeared before, a file being copied to an unknown external address. The job is to distinguish background noise from signal.',
    whatHappened: 'TechCorp endpoint security software flagged a range of processes across multiple workstations. Some were genuine threats — ransomware, a keylogger, a network worm, a trojan, spyware, and a virus. Others were entirely legitimate system processes doing their normal jobs. The challenge was separating malicious activity from legitimate system behaviour using observable evidence: what the program does, where it came from, and whether its network activity makes sense.',
    keyMove: 'Behaviour is the key indicator for Y12: what is the program actually doing? Encrypting files, copying itself to other machines, recording keystrokes, maintaining a suspicious external connection — these are red flags regardless of what the program calls itself. Legitimate software does predictable, documented things at expected times.',
    realWorld: 'In 2017, WannaCry ransomware spread to over 200,000 systems in 150 countries in a matter of hours, using worm functionality to propagate automatically without any user interaction. The NHS cancelled 19,000 appointments. The attack exploited an unpatched Windows vulnerability — the patch had been available for two months. Regular patching and isolated network segments are the primary defences.',
    quiz:[
      {q:'Which type of malware specifically disguises itself as a legitimate, useful program to trick a user into installing it?',options:['A worm — because it spreads to other computers automatically','A trojan — because it appears genuine but secretly carries out malicious actions','A virus — because it attaches itself to existing files and spreads when those files are run'],correct:1},
      {q:'A trojan horse differs from other malware primarily because:',options:['It can only infect systems running Windows operating systems','It presents as a legitimate, useful application while secretly performing malicious actions','It spreads automatically via email attachments without user interaction'],correct:1},
      {q:'Ransomware\'s final visible impact on a victim is typically:',options:['Silently exfiltrating data to an external server over several weeks','Displaying a ransom demand after encrypting the victim\'s files, making them inaccessible','Deleting all files without the possibility of recovery, even after payment'],correct:1},
      {q:'Ransomware is particularly damaging to organisations because:',options:['It spreads between computers without any user interaction, infecting an entire network in seconds','It encrypts files making them inaccessible, often bringing operations to a halt while the attacker demands payment for the decryption key','It deletes files permanently so they cannot be recovered even if the ransom is paid'],correct:1},
      {q:'An attacker who has access to one computer on a company network tries to gain access to other computers and servers within that same network. What is this technique called?',options:['Port scanning — testing which network ports are open on the target machines','Moving laterally — accessing other computers on the network to reach higher-value targets such as servers containing sensitive data','Packet sniffing — intercepting network traffic to capture data being transmitted between devices'],correct:1},
      {q:'Which malware type is specifically designed to intercept and record keyboard input in order to steal credentials?',options:['Spyware — which monitors all user activity including browser history and emails','A keylogger — which focuses specifically on capturing what the user types','A virus — which attaches to files and spreads when those files are shared or run'],correct:1},
      {q:'A device is infected with malware that is being controlled remotely by an attacker. What network behaviour would you most likely observe from this device?',options:['The device would stop connecting to the internet entirely','Regular outbound connections to an external address at fixed intervals, even when the user is not actively using the device','The device would connect to every other device on the network simultaneously to spread the infection'],correct:1},
      {q:'Spyware differs from a keylogger in that it:',options:['Only targets smartphones and tablet devices, not desktop systems','Captures a broader range of data — screenshots, browser history, saved credentials and clipboard contents — not just keyboard input','Must be installed manually by an attacker with physical access to the device'],correct:1},
      {q:'The WannaCry ransomware spread so rapidly because it combined ransomware behaviour with which other malware capability?',options:['Spyware functionality — it collected and sent user data to external servers on each infected machine','Worm functionality — it self-replicated automatically across a network by exploiting an unpatched vulnerability in millions of Windows systems without any user interaction','Trojan functionality — it disguised itself as a Windows system update'],correct:1},
      {q:'An organisation\'s files have all been encrypted and a message demands payment. What type of malware is responsible and what is the recommended response?',options:['A worm — the organisation should disconnect affected devices from the network immediately','Ransomware — the organisation should restore from a clean offline backup rather than paying the ransom, as payment does not guarantee recovery','Spyware — the organisation should change all passwords immediately as credentials have been captured'],correct:1},
      {q:'What is the difference between spyware and a keylogger?',options:['Spyware only targets mobile devices; keyloggers only target desktop computers','A keylogger specifically records keyboard input; spyware collects a broader range of data including screenshots, browsing history and credentials','Keyloggers are always installed physically; spyware is always delivered by email'],correct:1},
      {q:'Why are worms considered more dangerous than viruses in terms of network impact?',options:['Worms are more dangerous because they always encrypt files, whereas viruses only replicate themselves','Worms spread automatically across a network without needing a user to open a file or click anything — a single infected device can compromise an entire network rapidly','Worms are more dangerous because they are invisible to antivirus software, whereas viruses always trigger alerts'],correct:1},
      {q:'Which of the following best describes the behaviour of a computer worm?',options:['It attaches to a legitimate file and spreads when that file is shared or run by a user','It self-replicates automatically across a network without needing any user to take an action','It disguises itself as useful software to trick users into installing it deliberately'],correct:1},
      {q:'Which defence is most effective against ransomware once a device is already infected?',options:['Running antivirus software, which can decrypt the files once the malware type is identified','Restoring files from a recent offline or cloud backup that predates the infection','Paying the ransom immediately, as this is the only guaranteed way to recover the files'],correct:1},
      {q:'Antivirus software uses two main approaches to detect malware. What is the limitation of matching against a database of known threats?',options:['This approach uses too much processing power to run on modern devices','It can only detect threats already in the database — new or modified malware that has not been seen before will not be recognised','This approach produces too many false positives and blocks legitimate software'],correct:1}
    ]
  },
  reportTeams:{
    correct:'Incident Response Team',
    incorrect:'Legal Department',
  },

};


// ── Update MODULE_LIST to include all 7 modules ───────────────
if(typeof MODULE_LIST !== 'undefined'){
  MODULE_LIST.length = 0;
} else {
  var MODULE_LIST = [];
}
['packetAnalysis','encryptionAudit','sqlInjection','firewallReview','legalCompliance','socialEngineering','malwareAnalysis']
  .forEach(m => MODULE_LIST.push(m));

// ── Column definitions for new modules ───────────────────────
MODULE_COLUMNS.socialEngineering = [
  { key:'name',            label:'CASE ID'      },
  { key:'purpose',         label:'SCENARIO'     },
  { key:'channel',         label:'CHANNEL'      },
  { key:'claimedIdentity', label:'CLAIMS TO BE' },
  { key:'asks',            label:'REQUESTS'     },
  { key:'redflag',         label:'RED FLAGS'    },
];

MODULE_COLUMNS.malwareAnalysis = [
  { key:'name',        label:'PROCESS'       },
  { key:'purpose',     label:'DESCRIPTION'   },
  { key:'location',    label:'PATH TYPE'     },
  { key:'activity',    label:'KEY ACTIVITY'  },
  { key:'connections', label:'NETWORK'       },
];

// ── Action buttons for new modules ───────────────────────────
MODULE_ACTIONS.socialEngineering = [
  { id:'block',   label:'🚫 BLOCK & REPORT'        },
  { id:'verify',  label:'🔍 VERIFY INDEPENDENTLY'  },
  { id:'allow',   label:'✅ LEGITIMATE'            },
];

MODULE_ACTIONS.malwareAnalysis = [
  { id:'isolate',     label:'🔴 ISOLATE HOST'    },
  { id:'investigate', label:'🔍 INVESTIGATE'     },
  { id:'allow',       label:'✅ ALLOW (LEGITIMATE)' },
];

// ── PLAIN ENGLISH CONTEXT ─────────────────────────────────────
// Neutral observer descriptions of each scenario — no judgment,
// just what the data shows. Keyed by scenario name (or name|RAG
// for SQL injection where the same endpoint appears as R, A, and G).
if(typeof SCENARIO_CONTEXT==='undefined'){var SCENARIO_CONTEXT={};}

SCENARIO_CONTEXT.packetAnalysis = {
'FLOW-A1':"A single external IP is sending connection requests at roughly 47,000 per second. Each request begins the TCP handshake but none of them complete — no acknowledgement packets are coming back.",
'FLOW-A2':"Small outbound DNS queries are being sent with TechCorp\'s IP as the source address, causing large DNS responses from multiple public servers to flood back into the network.",
'FLOW-A3':"An external host is testing port numbers in ascending order — sending a brief packet to each one and moving to the next within milliseconds.",
'FLOW-A4':"The network is receiving ICMP echo request packets from an external address at a rate far above what any diagnostic tool would generate.",
'FLOW-A5':"Multiple external addresses are each starting TCP connections but never completing them — the server is allocating resources for connections that never finish their three-way handshake.",
'FLOW-B1':"An SSH connection to an internal server was established from an IP address that appears in threat intelligence feeds as a known Tor exit node. The authentication completed successfully.",
'FLOW-B2':"An authenticated session is active from an IP address geolocated in a country where TechCorp has no employees or offices.",
'FLOW-B3':"An internal workstation is accessing network file shares via SMB and opening a large number of directories in a short period — including folders outside its normal business function.",
'FLOW-C1':"An internal workstation is making HTTPS requests to external IPs associated with common cloud productivity services. Traffic volume and timing match normal business-hours activity.",
'FLOW-C2':"Internal hosts are querying a known public DNS resolver. Query types and volumes match the pattern expected during normal working hours.",
'FLOW-C3':"UDP packets are flowing between an internal server and an external address on port 123. Packet sizes and timing intervals are consistent with clock synchronisation.",
'FLOW-C4':"The internal mail server is forwarding outbound messages to an external mail relay. Volumes and destination addresses match today\'s expected communications.",
};

SCENARIO_CONTEXT.encryptionAudit = {
'db-auth-service':"This system uses an encryption algorithm with a 56-bit key length. Modern hardware can exhaustively test every possible key combination in a matter of hours.",
'user-passwords-v1':"Passwords are processed using a fast general-purpose hashing function with no additional randomisation before hashing. The same password input always produces the same stored output.",
'legacy-vpn-stream':"VPN sessions are encrypted using a stream cipher with known statistical weaknesses — certain output byte patterns are more predictable than a truly random stream would produce.",
'api-key-exchange':"API authentication uses a 512-bit RSA key pair. The security of RSA depends on the difficulty of factoring large numbers — this key length has been successfully factored by researchers.",
'cert-signing-internal':"Internal certificates are signed using a hashing algorithm for which researchers have demonstrated collision attacks — two different inputs can produce the same output hash.",
'backup-encrypt-legacy':"Backup files are encrypted using three successive rounds of DES with an effective key strength of 112 bits. The underlying DES algorithm dates from the 1970s.",
'file-store-aes128':"Documents are encrypted with AES-128 in CBC mode. The key length is within accepted ranges, but CBC mode produces identical ciphertext blocks for identical plaintext blocks and has no built-in integrity check.",
'rsa-1024-signing':"Document signing uses 1024-bit RSA keys. This falls below the 2048-bit minimum now recommended by standards bodies for new implementations.",
'db-encrypt-primary':"The primary database uses AES-256 in GCM mode — a configuration that provides both confidentiality and integrity verification in a single operation, meeting current standards.",
'tls-key-exchange':"TLS sessions use 2048-bit RSA for key exchange. This meets current minimum recommendations from NIST and the NCSC.",
'user-passwords-v2':"Passwords are stored using a function designed specifically for password hashing. Each stored value includes a unique random element, so identical passwords produce different outputs. Computation is deliberately slow.",
'file-integrity-check':"File hashes are computed using SHA-256, producing a 256-bit output. No practical collision attack is known against this function at this output length.",
};

SCENARIO_CONTEXT.sqlInjection = {
'/api/v1/auth/login|R':"The username field received input containing SQL comment syntax. The server returned a 200 OK and a valid session token — despite no matching account existing in the expected format.",
'/search|R':"The search parameter contained a statement terminator followed by a destructive command. The server returned a 500 error and the product catalogue is no longer returning results.",
'/api/v2/products|R':"The product ID parameter contained a UNION keyword and a SELECT clause. The server response included database field names and row data not normally returned by this endpoint.",
'/admin/exec|R':"A POST request to the admin endpoint contained a raw SELECT query as the body. The server returned rows from an internal system table including credential data.",
'/api/v1/user/profile|R':"The user ID parameter in the URL contained a condition that evaluates as true for every row. The response returned records for multiple users rather than a single profile.",
'/forms/contact|A':"The email field in the contact form contained an apostrophe. The server returned a verbose error message that included a fragment of the underlying database query.",
'/api/v3/search|A':"The search string contained SQL metacharacters that were not stripped before processing. The server response time was several seconds above the normal baseline for this endpoint.",
'/api/v1/register|A':"The chosen username contained SQL syntax characters. The server returned a generic error, but the request appears in the audit log with a response time suggesting the database attempted to process it.",
'/api/v1/auth/login|G':"Standard alphanumeric credentials in the expected format. The server validated them against stored values and returned a session token.",
'/search|G':"A plain text search string with no special characters. The server returned a filtered product result set with response time within the normal range.",
'/forms/contact|G':"A complete form submission with name, email, and message fields — all containing standard text with no SQL syntax or special characters in any field.",
'/api/v2/products|G':"A product listing request with a standard numeric ID. The server returned the expected record and the response matched the documented API schema.",
};

SCENARIO_CONTEXT.firewallReview = {
'CR-2025-0041':"If approved, SSH connections would be permitted from any IP address on the public internet to internal servers. Port 22 would be reachable from the entire address space without restriction.",
'CR-2025-0044':"If approved, remote desktop connections would be accepted from any internet address. TCP port 3389 would be accessible to every external IP.",
'CR-2025-0047':"If approved, internal hosts could initiate sessions using a protocol that transmits the entire connection — including any text entered — without encryption.",
'CR-2025-0053':"If approved, a Finance workstation could make outbound connections on any TCP port to any external destination — no restriction on protocol, service, or target.",
'CR-2025-0038':"If approved, hosts in the 192.168.50.0/24 subnet could reach the application server over HTTPS. That subnet is shared between developer workstations and guest Wi-Fi devices.",
'CR-2025-0049':"If approved, developer workstations could connect outbound to any external address on TCP port 8080 — commonly used for web proxies, development servers, and some remote management tools.",
'CR-2025-0055':"If approved, VNC remote-desktop connections would be accepted from a range covering contractor laptops assigned to third-party consultants on the internal network.",
'CR-2025-0033':"If approved, any internet host could connect to the web server in the DMZ over HTTPS on port 443. That server hosts TechCorp\'s public-facing website.",
'CR-2025-0036':"If approved, internal hosts could connect outbound over HTTPS to Microsoft\'s published IP address ranges, covering Microsoft 365, Teams, and Azure services.",
'CR-2025-0039':"If approved, internal hosts could only send DNS queries to the company\'s own resolver addresses — all other DNS destinations would be blocked.",
'CR-2025-0042':"If approved, inbound email on port 25 would be accepted from any internet source to the mail relay server in the DMZ — the standard path for receiving external email.",
};

SCENARIO_CONTEXT.legalCompliance = {
'INC-2025-0014':"An employee installed software on a colleague\'s work device without their knowledge. The software recorded all keystrokes and forwarded them to the employee\'s home email address over four weeks.",
'INC-2025-0019':"A former employee whose credentials were not revoked at their leaving date connected remotely to internal systems seven days later and accessed HR records including salary data.",
'INC-2025-0022':"An employee with elevated server permissions ran software overnight that encrypted every file on three shared drives. A ransom note was found in each encrypted directory.",
'INC-2025-0031':"A developer connected to the production database using a shared admin credential, bypassing the change-control process, and ran queries against a table containing live customer payment data.",
'INC-2025-0035':"An employee configured their mail client to silently forward a manager\'s incoming email to their own inbox. Some messages were deleted before the manager saw them.",
'INC-2025-0008':"A customer services employee extracted records from the CRM system across multiple sessions and provided them to a third-party marketing company. No data-sharing agreement existed for this purpose.",
'INC-2025-0011':"A payroll spreadsheet listing gross salary, deductions, and net pay for all 340 employees was sent as an email attachment to the entire company all-staff distribution list.",
'INC-2025-0026':"An audit found customer records from a project that ended in 2012, still stored on a network drive. The contract specified all data would be deleted within 24 months of project completion.",
'INC-2025-0003':"A software audit found applications on an employee\'s company laptop not on the approved list and with no purchase or licence record. The tools were in active daily use.",
'INC-2025-0007':"An analyst used their standard employee login to view their own personnel file to check their remaining holiday entitlement. No other records were accessed and nothing was exported.",
'INC-2025-0016':"A trainee ran SELECT and INSERT queries on a development server isolated from production systems and containing only synthetic test data, using credentials issued for this purpose.",
};

SCENARIO_CONTEXT.socialEngineering = {
'SE-001':"A caller identifying themselves as a named employee asked the IT help desk to reset an account password immediately, citing an emergency. They could not provide the standard verification answers when asked.",
'SE-002':"An email appearing to come from the Finance Director asked the accounts team to transfer money to a new supplier within two hours. The sender\'s domain differed from the company domain by one character.",
'SE-003':"An email addressed to a project lead by name referenced a live internal project using its correct code name and included a file described as an updated specification document.",
'SE-004':"A USB drive was found in the company car park, labelled with a description likely to attract curiosity. Security camera footage shows an unknown individual placing it there the previous evening.",
'SE-005':"An individual arrived at reception claiming to be a facilities contractor needing access to the server room. There is no record of a booked visit in the facilities management system.",
'SE-006':"A message from a newly created profile asked a network engineer for details about the company\'s internal IP addressing scheme, citing a job application as the reason.",
'SE-007':"An email with vendor branding stated that the company\'s cloud account had been flagged and would be suspended within 24 hours unless credentials were re-entered via a link in the email.",
'SE-008':"A help desk ticket from an unfamiliar internal address asked IT to add a remote monitoring tool to the approved software list. It cited a senior manager\'s name but contained no project reference.",
'SE-009':"A text message claiming to be from the company IT department asked all recipients to re-authenticate their accounts following a system migration by clicking a link. The sending number was not recognised.",
'SE-010':"A password reset confirmation email arrived from the company\'s own IT portal, referencing a request the recipient had submitted through the self-service system ten minutes earlier.",
'SE-011':"A new supplier onboarding form arrived via the company\'s procurement portal, requesting bank details for payment setup. It references the signed contract number and the supplier contact named in it.",
'SE-012':"The facilities manager notified staff last week of a scheduled inspection today. An inspector arrived at reception, signed in through the visitor management system, and presented verifiable identification.",
};

SCENARIO_CONTEXT.malwareAnalysis = {
'ransomware.exe':"Every document on this device has had its file extension changed to .locked within the last ten minutes. A message has appeared on the screen demanding payment.",
'keylogger.exe':"This program has been running since the device started up. It is sending small packets of data to an external server every five minutes.",
'network_worm.exe':"This program has copied itself to fourteen other computers on the internal network. Those copies are now also active and repeating the same process.",
'trojan_remote.exe':"This program was installed alongside what appeared to be a free video player. It is maintaining a continuous encrypted connection to an external server and responding to data arriving on that connection.",
'spyware_browser.exe':"This program reads data from the browser every thirty minutes and sends it to an external server. The data includes pages visited and information saved in the browser.",
'virus_infector.exe':"This program has modified 42 other programs on the device by adding a copy of itself to each one. Sharing any of those programs would carry the infection to another device.",
'adware_toolbar.exe':"This program arrived as part of a free game download. It has changed the browser homepage and is inserting additional adverts. It is also sending a record of websites visited to an external company.",
'macro_runner.exe':"A script inside a document received by email started running when the document was opened. Within seconds it made a connection to an external address to download additional content.",
'unverified_update.exe':"This appears to be an update for installed software, but it came from an unofficial website and has no digital signature from the software developer.",
'MsMpEng.exe':"The built-in Windows antivirus software is running its scheduled weekly check of all files on the device. CPU usage is high during this process.",
'wuauclt.exe':"Windows is downloading this month security patches from Microsoft. Files are being downloaded from Microsoft servers and the sizes match the published update list.",
'VeeamAgent.exe':"The company backup software is copying all files on the system drive to the backup server. This started at 02:00 and matches the scheduled Sunday backup job.",
};
// ── STANDARD DIFFICULTY CONTEXT ───────────────────────────────
// Factual restatement only — no anomaly flags, no significance.
// Student has to recognise what is unusual themselves.
if(typeof SCENARIO_CONTEXT_STD==='undefined'){var SCENARIO_CONTEXT_STD={};}

SCENARIO_CONTEXT_STD.packetAnalysis = {
'FLOW-A1':"47,200 TCP SYN packets per second from 45.92.14.7. Destination: port 80. No ACK responses in capture window.",
'FLOW-A2':"Outbound DNS queries with TechCorp source IP. Large DNS responses arriving from multiple external servers.",
'FLOW-A3':"Sequential port probing from external host — one packet per port, ascending order.",
'FLOW-A4':"ICMP echo request packets from external source. High packet volume.",
'FLOW-A5':"TCP SYN packets from multiple external IPs. No corresponding ACK or SYN-ACK responses completing the handshake.",
'FLOW-B1':"SSH connection to internal server from IP in Tor exit node range. Authentication successful.",
'FLOW-B2':"Authenticated session active. Source IP geolocated outside UK and EU. Connection encrypted.",
'FLOW-B3':"Internal workstation querying network file shares via SMB. Multiple directory accesses in short period.",
'FLOW-C1':"HTTPS traffic from internal workstation to external cloud service IPs. Port 443.",
'FLOW-C2':"DNS A-record queries from internal hosts to public resolver. Standard volumes.",
'FLOW-C3':"UDP port 123 traffic between internal server and external NTP host.",
'FLOW-C4':"SMTP traffic from internal mail server to external relay. Standard forwarding pattern.",
};

SCENARIO_CONTEXT_STD.encryptionAudit = {
'db-auth-service':"Authentication database. Algorithm: DES. Key length: 56 bits.",
'user-passwords-v1':"Password store. Algorithm: MD5. No salt. One hash output per password.",
'legacy-vpn-stream':"VPN session encryption. Algorithm: RC4 stream cipher.",
'api-key-exchange':"API authentication. Algorithm: RSA. Key length: 512 bits.",
'cert-signing-internal':"Internal certificate signing. Algorithm: SHA-1.",
'backup-encrypt-legacy':"Backup file encryption. Algorithm: 3DES. Effective key strength: 112 bits.",
'file-store-aes128':"Document store encryption. Algorithm: AES-128-CBC. Mode: Cipher Block Chaining.",
'rsa-1024-signing':"Document signing. Algorithm: RSA. Key length: 1024 bits.",
'db-encrypt-primary':"Primary database encryption. Algorithm: AES-256-GCM. Mode: Galois/Counter Mode with integrity check.",
'tls-key-exchange':"TLS key exchange. Algorithm: RSA. Key length: 2048 bits.",
'user-passwords-v2':"Password store. Algorithm: bcrypt. Work factor: 12. Unique salt per entry.",
'file-integrity-check':"File integrity verification. Algorithm: SHA-256. Output: 256-bit digest.",
};

SCENARIO_CONTEXT_STD.sqlInjection = {
'/api/v1/auth/login|R':"POST /api/v1/auth/login. Username field value: ' OR '1'='1' --. HTTP response: 200 OK, session token issued.",
'/search|R':"GET /search?q=1; DROP TABLE orders; --. HTTP response: 500 Internal Server Error.",
'/api/v2/products|R':"GET /api/v2/products?id=1 UNION SELECT username,pwd_hash FROM users --. Response: 200 with additional data fields.",
'/admin/exec|R':"POST /admin/exec. Body contains SELECT query against system table. Response: 200 with row data.",
'/api/v1/user/profile|R':"GET /api/v1/user/profile?id=1 OR 1=1. Response: multiple user records returned.",
'/forms/contact|A':"POST /forms/contact. Email field contains apostrophe. Server returned 500 error including SQL fragment.",
'/api/v3/search|A':"GET /api/v3/search?q=[special chars]. Response time: 4.2s. Baseline: 0.3s.",
'/api/v1/register|A':"POST /api/v1/register. Username field contains SQL metacharacters. Response: 400. Appears in audit log.",
'/api/v1/auth/login|G':"POST /api/v1/auth/login. Standard alphanumeric credentials. Response: 200 OK, session token issued.",
'/search|G':"GET /search?q=blue+trainers. Alphanumeric query string. Response: 200, results within baseline response time.",
'/forms/contact|G':"POST /forms/contact. All fields contain standard text characters. Response: 200 OK.",
'/api/v2/products|G':"GET /api/v2/products?id=42. Numeric ID parameter. Response: 200, single product record.",
};

SCENARIO_CONTEXT_STD.firewallReview = {
'CR-2025-0041':"Proposed: Allow inbound TCP 22 from 0.0.0.0/0 to internal servers.",
'CR-2025-0044':"Proposed: Allow inbound TCP 3389 from 0.0.0.0/0 to internal hosts.",
'CR-2025-0047':"Proposed: Allow outbound TCP 23 to any destination.",
'CR-2025-0053':"Proposed: Allow outbound TCP 0-65535 from Finance workstation to any destination.",
'CR-2025-0038':"Proposed: Allow inbound TCP 443 from 192.168.50.0/24 to app server. Subnet includes developer and guest devices.",
'CR-2025-0049':"Proposed: Allow outbound TCP 8080 from developer workstations to any destination.",
'CR-2025-0055':"Proposed: Allow inbound TCP 5900 from 10.20.0.0/16 to server farm. Range includes third-party contractor devices.",
'CR-2025-0033':"Proposed: Allow inbound TCP 443 from 0.0.0.0/0 to web server in DMZ.",
'CR-2025-0036':"Proposed: Allow outbound TCP 443 from internal hosts to Microsoft published IP ranges.",
'CR-2025-0039':"Proposed: Allow outbound UDP 53 from internal hosts to company DNS servers only. All other DNS destinations blocked.",
'CR-2025-0042':"Proposed: Allow inbound TCP 25 from 0.0.0.0/0 to mail relay in DMZ.",
};

SCENARIO_CONTEXT_STD.legalCompliance = {
'INC-2025-0014':"Keylogging software found on colleague\'s workstation. Keystrokes forwarded to personal email. Period: 4 weeks.",
'INC-2025-0019':"Former employee accessed internal systems remotely 7 days after leaving date. Credentials not revoked. Files accessed: HR records.",
'INC-2025-0022':"File encryption software executed overnight by employee with elevated server permissions. Three shared drives encrypted.",
'INC-2025-0031':"Developer connected to production database using shared admin credential. Queried customer payment table. No change-control approval.",
'INC-2025-0035':"Email forwarding rule found on employee mail client. Manager\'s incoming email redirected to employee inbox. Some messages deleted.",
'INC-2025-0008':"CRM records exported by customer services employee. Transferred to third-party marketing company. No data-sharing agreement.",
'INC-2025-0011':"Payroll spreadsheet — 340 employees, salary data — sent to all-staff email distribution list.",
'INC-2025-0026':"Customer data from 2012 project found on active network drive. Contract required deletion within 24 months of project end.",
'INC-2025-0003':"Software on company laptop not on approved list. No purchase or licence record. In active daily use.",
'INC-2025-0007':"Employee accessed own personnel record via standard login. Viewed annual leave balance. No other records accessed.",
'INC-2025-0016':"Trainee ran SQL queries on development server containing synthetic test data. Training credentials used.",
};

SCENARIO_CONTEXT_STD.socialEngineering = {
'SE-001':"Inbound call to IT help desk requesting account password reset. Caller unable to provide standard verification details.",
'SE-002':"Email requesting £42,000 transfer to new supplier within 2 hours. Sender domain differs from company domain by one character.",
'SE-003':"Email to project lead by name. References live internal project code. Attachment: updated specification document.",
'SE-004':"USB drive in company car park. Label: Q4 Redundancy List. Placed by unknown individual previous evening.",
'SE-005':"Individual at reception claiming to be HVAC contractor. Requesting server room access. No visit record in facilities system.",
'SE-006':"Message requesting internal IP addressing scheme details. Sender profile created 3 days ago.",
'SE-007':"Email with Microsoft branding. Claims Azure account flagged. Requests credential re-entry via link. Deadline: 24 hours.",
'SE-008':"Help desk ticket requesting software whitelist addition. References senior manager. No project code or approval number.",
'SE-009':"SMS requesting account re-authentication via link. Claims to be from company IT. Sending number not on record.",
'SE-010':"Password reset email from company IT portal. References self-service request submitted 10 minutes earlier.",
'SE-011':"Supplier onboarding form via procurement portal. Requests bank account details. References signed contract number.",
'SE-012':"Fire safety inspector at reception. Visit pre-notified by facilities manager last week. Signed in, ID presented.",
};

SCENARIO_CONTEXT_STD.malwareAnalysis = {
'ransomware.exe':"Files affected: all documents (extension changed to .locked). File write rate: 3,400/min. Ransom note present on desktop.",
'keylogger.exe':"Keyboard input captured at regular intervals. Outbound data every 5 minutes. Running since device startup.",
'network_worm.exe':"Copies written to 14 internal devices. Copies now active and repeating process. No user action required for spread.",
'trojan_remote.exe':"Source: free_videoplayer_setup.exe. Persistent outbound encrypted connection. Responding to inbound data.",
'spyware_browser.exe':"Browser data accessed every 30 minutes. Outbound uploads to 194.x.x.x. Data: browsing history and saved credentials.",
'virus_infector.exe':"42 .exe files modified on C: drive. Modification: copy of virus appended. Network activity: none.",
'adware_toolbar.exe':"Source: free_game_installer.exe. Browser homepage changed. Outbound: browsing data to advertising network.",
'macro_runner.exe':"Source: email attachment Invoice_March.docx. Macro executed on open. Outbound connection on execution.",
'unverified_update.exe':"Claimed function: software update. Publisher: unsigned. Source: non-official domain.",
'MsMpEng.exe':"Windows Defender. Elevated CPU during scheduled scan window. No network activity.",
'wuauclt.exe':"Windows Update. Outbound: Microsoft CDN. File sizes match current patch manifest.",
'VeeamAgent.exe':"Backup agent. Start time: 02:00 Sunday. Destination: company backup server.",
};