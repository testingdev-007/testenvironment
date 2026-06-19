/* ════════════════════════════════════════════════════════════
   CYBERSHIELD ACADEMY
   FILE: chat-data_2026-06-10_v5.js
   ROLE: chat-data.js
   ════════════════════════════════════════════════════════════ */
/* ================================================================
   CHAT-DATA V2 — CyberShield Academy
   Expanded message pools, context-sensitive scaffolding,
   progressive stuck hints, natural group-chat feel.
   ================================================================ */

var PERSONAS = {
  zara:   { id:'zara',   name:'Zara K.'  },
  marcus: { id:'marcus', name:'Marcus T.' },
  priya:  { id:'priya',  name:'Priya S.' },
};

// ── GENERAL ───────────────────────────────────────────────────
var GENERAL_GROUP_CHAT = {
  welcome: [
    { persona:'zara',   msgs:["Hey! Ready to catch some hackers? 🕵️","Welcome, detective! Hit that green button when you're set 👇","Omg the new detective is HERE! We've been waiting!","Let's gooo! New recruit in the building! 🚨"] },
    { persona:'marcus', msgs:["Wagwan! You joining the cyber squad? Let's go! 💪","Big up the new detective! We need you on this team.","Safe! Another pair of eyes is exactly what we needed.","Yooo finally! We're always short-staffed. Welcome!"] },
    { persona:'priya',  msgs:["Welcome to the Security Operations Centre. Glad you're here.","Hi! We get live cyber alerts all day. You help us investigate them.","Good to have you. The more people checking, the fewer attacks get through.","Hey! Just a heads up — real hackers attack real companies every single day. What we do matters."] },
  ],
  between: [
    { persona:'zara',   msgs:["Great work! Check for new emails — another case might have come in.","You're getting good at this! Hit that refresh button 🔄"] },
    { persona:'marcus', msgs:["W investigator! Next case incoming 📨","That's how it's done. Ready for the next one?"] },
    { persona:'priya',  msgs:["Case closed. Check your inbox — attackers don't take breaks.","Good work. There's always another one coming."] },
  ],
  idle: [
    { persona:'marcus', msgs:[
      "All quiet... for now 👀",
      "Did you know the first computer bug was a real moth? 🦗",
      "Network's calm. Enjoy it!",
      "Priya just made coffee. Jealous. ☕",
      "Nothing yet. Hackers must be having a snack.",
      "Fun fact: some DDoS attacks use millions of computers at once!",
      "Quiet spell. Use it to think. 🧠",
      "Still here if you need us!",
    ]},
    { persona:'zara', msgs:[
      "No rush — take your time.",
      "Always here if you've got questions!",
      "Quiet is good in this job.",
      "Being thorough beats being fast. Always.",
      "How are you finding it so far?",
    ]},
    { persona:'priya', msgs:[
      "Low threat right now. Stay sharp anyway.",
      "Hackers love when people get comfortable.",
      "Quiet period. Good time to think.",
      "I'm running background scans. Nothing flagged.",
    ]},
  ],
};

var GLOBAL_CHAT = {

  toolCorrect: [
    {persona:'marcus', msgs:["That's it! ✅","Right tool! Let's go 🎯","Locked in!","That's the one! 🙌","Yes! 💪","Nailed it!","Bingo!"]},
    {persona:'zara',   msgs:["Perfect. 👌","Exactly right.","Good call.","Spot on. ✨","That's what I'd pick.","Sharp!"]},
    {persona:'priya',  msgs:["Confirmed. ✓","Correct. Go.","Right tool.","Good.","That works."]},
  ],

  toolWrong: [
    {persona:'zara',   msgs:["Hmm — re-read the email. The attack type is your clue 🔍","Not quite! What does the email say is happening?","Check the email — which tool matches that kind of problem?"]},
    {persona:'marcus', msgs:["Not that one! Your email's the clue 😄","Wrong tool! What type of attack is it? Go back and check!","Sneak peek: the answer's in your email!"]},
    {persona:'priya',  msgs:["Wrong one. Read the email again — what's the threat?","The email tells you what to look for. Which tool does that?","Check the email. Attack type → right tool."]},
  ],

  actionCorrect: [
    {persona:'marcus', msgs:["Yes! 🎯","Called it! 💪","Boom! ✅","Nailed it!","Clean! ✨","Exactly!","👏","Solid!","Sharp!","Easy for you! 😄","That one was sneaky — well done!","Knew you'd get that!","💯","Beautiful!","Love it!"]},
    {persona:'zara',   msgs:["Spot on. 👌","Smart move.","That's the one.","Good instinct!","Correct. ✓","Perfect.","Really confident call — nice!","Good thinking.","Well spotted!","Exactly what I'd do.","That takes sharp eyes.","Nice."]},
    {persona:'priya',  msgs:["Correct. ✔","Right call.","That checks out.","Yep. ✓","Exactly.","Good.","That's it."]},
  ],

  actionWrong: [
    {persona:'zara',   msgs:["Hmm — look at the data again. What does it actually tell you?","Think about it — is this a lot, a little, or normal?","Look more carefully. What's actually going on there?"]},
    {persona:'marcus', msgs:["Ooh — look again! Is this really bad, a bit odd, or totally fine?","Check the numbers — does that seem normal to you?","Not quite! Take another look at what the data shows 🔍"]},
    {persona:'priya',  msgs:["Wrong action. Look at the data again — what does it mean?","Think about the scale. A tiny bit odd, or really concerning?","Re-read that card. What's the key piece of data telling you?"]},
  ],

  allHandled: [
    {persona:'marcus', msgs:["All done! Last step — who gets the report? 📋","Boom — all handled! Now pick the right team 👇","Finished! One more move...","Nearly there! Who do we tell?"]},
    {persona:'zara',   msgs:["Good work! Now — who should this report go to?","All assessed! Pick the right team.","Last step — which team handles this type of thing?","Almost done. Think about who to report to."]},
  ],

  reportCorrect: [
    {persona:'zara',   msgs:["Perfect team choice! 🏆","Yes — they're on it!","Exactly right!","Right people, right time!"]},
    {persona:'marcus', msgs:["YESSS! Right team! 🦸","Hero! That's the one! 💪","Couldn't pick better! 🎯","They've got it from here! Let's go!"]},
    {persona:'priya',  msgs:["Correct. They'll handle it. ✓","Right team. Well done.","Good call."]},
  ],

  reportWrong: [
    {persona:'zara',   msgs:["Wrong team — who actually deals with THIS type of problem?","Hmm. Think about what kind of incident this is. Which team owns that?"]},
    {persona:'priya',  msgs:["That team wouldn't handle this. What's the job? Who does that job?","Wrong team. Think: what kind of attack is it, who responds to that?"]},
    {persona:'marcus', msgs:["Nope! Think about what team actually handles this stuff 😬","Not them! Which team owns this type of problem?"]},
  ],

  scenarioComplete: [
    {persona:'marcus', msgs:["MISSION COMPLETE! 🎉","Done and dusted! 🌟","Another one down! 💪","CRUSHED IT! 🏆","Agent-level work right there!","You're getting dangerous at this 😄","That was class! 🔥"]},
    {persona:'zara',   msgs:["Great work! 🌟","Really solid.","Nicely handled.","You did well there.","Impressive work!","That was great!"]},
    {persona:'priya',  msgs:["Clean work. ✓","Well done.","Handled properly.","Mission complete. ✓","Solid."]},
  ],

};

// ── MODULE-SPECIFIC CHAT ───────────────────────────────────────
// Only needs: onLoad_1 (heads up), onLoad_2 (start here),
// onActionWrong (contextual hint for this module's data)

// ── MODULE CHAT ────────────────────────────────────────────────
var MODULE_GROUP_CHAT = {

  // ════════════════════════════════════════════════════════════
  // DDoS
  // ════════════════════════════════════════════════════════════
  ddos: {
    onLoad_1:[
      { persona:'marcus', msgs:["Our website's getting SLAMMED with traffic 📈 Could be a DDoS!","Traffic spike alert! Something's flooding our servers.","Whoa — way too many requests hitting us at once. Not normal.","Someone might be sending fake traffic to crash our site. Check it!"] },
      { persona:'zara',   msgs:["Uh oh — traffic is spiking really badly right now 😬 Could be an attack!","A DDoS is like a mob of bots all hammering our door at once. Let's check which services are getting hit.","Heads up — unusual traffic levels! Some of these might be fine though, so look carefully."] },
      { persona:'priya',  msgs:["DDoS stands for Distributed Denial of Service — basically flooding a server until it crashes.","Think of a DDoS like a prank where thousands of people call the same phone number at once. The line jams.","Some high traffic IS normal — like if we just launched something new. You have to compare it to the average."] },
    ],
    onLoad_2:[
      { persona:'zara',   msgs:["Read your email first — then load the Network Traffic Monitor ☝️","Email → Network Traffic Monitor. Look at those hit numbers!"] },
      { persona:'priya',  msgs:["Open the email, then pick the Network Traffic Monitor. Compare current traffic to the average.","Email first. Tool: Network Traffic Monitor. The numbers tell the story."] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Psst — look at the numbers in the right-hand columns 👀"] },
      { persona:'marcus', msgs:["Check the 'current hits per minute' vs the 'average' — what's the gap? 📊"] },
      { persona:'priya',  msgs:["Here's the rule: if current is 3–10× normal, that's amber. More than 10×? That's a red. Does that help?"] },
      { persona:'zara',   msgs:["Ok so like... if something usually gets 200 hits/min and now it's getting 8,000... that's 40× normal. Definitely not fine 😬"] },
    ],
    onHalfway:[
      { persona:'marcus', msgs:["Halfway there! Remember — big spike = problem, tiny spike = probably fine 👍"] },
      { persona:'priya',  msgs:["Good progress. Keep comparing current to average. Some high traffic is actually legitimate."] },
    ],
    onActionWrong:[
      { persona:'marcus', msgs:["Hmm — take another look at the hit numbers? Is that difference big, medium or tiny?","Think of it in multiples. 2× normal? Fine. 30× normal? Very much not fine!","Is that traffic level really out of control, a bit much, or about normal?"] },
      { persona:'priya',  msgs:["Check the note at the bottom of the card — it usually tells you the multiple.","Compare the current number to the average. What's the ratio? That's the key clue.","Some high traffic has an explanation (like a product launch). Does this one?"] },
      { persona:'zara',   msgs:["Not quite! The answer is hidden in the numbers 🔢","Double check that one — the multiple matters a lot here!"] },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // MALWARE
  // ════════════════════════════════════════════════════════════
  malware: {
    onLoad_1:[
      { persona:'zara',   msgs:["Something weird is running on one of our computers 😬","Suspicious program detected! Could be malware hiding on the system.","Unknown process alert — something's on one of our machines that shouldn't be.","Malware means 'bad software'. It hides on your computer and causes damage. Let's find it!"] },
      { persona:'marcus', msgs:["Ooh we've got a sneaky one 🕵️ Something's hiding in the process list.","Bad software alert! One of these programs looks dodgy.","Programs hiding on a computer = malware. Let's find which one it is."] },
      { persona:'priya',  msgs:["Malware often pretends to be a real program. Look for unusual names or names that almost match real ones.","Three things to check: the program name, the CPU usage, and how much network data it's using.","CPU stands for processor — it's like the computer's brain. If an unknown program is using loads of it, something's wrong."] },
    ],
    onLoad_2:[
      { persona:'marcus', msgs:["Email first — then load the Process Monitor. Find the dodgy program!","Read it, then Process Monitor. Which one looks wrong?"] },
      { persona:'zara',   msgs:["Open the email, then grab the Process Monitor ☝️","Email → Process Monitor. Look at those program names carefully!"] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Look at the program NAME first — does it look like something real? 👀"] },
      { persona:'marcus', msgs:["Real Windows programs: Chrome, Explorer, Edge. Fake ones have weird names or spellings. What do you see? 🤔"] },
      { persona:'priya',  msgs:["Name looks strange? Unknown? That's probably a red. Name is real but CPU is very high? That might be amber. Normal name, low CPU? Green."] },
      { persona:'zara',   msgs:["Ok so if you see something called 'xyzwin32.exe' or 'cryptminer.tmp'... those aren't real programs 😅 Real ones are things like svchost.exe, explorer.exe, etc."] },
    ],
    onHalfway:[
      { persona:'priya',  msgs:["Good progress. Windows Update uses a lot of CPU sometimes — that's actually fine!"] },
      { persona:'marcus', msgs:["Halfway! Just remember — if you don't recognise the name, that's suspicious 🔍"] },
    ],
    onActionWrong:[
      { persona:'priya',  msgs:["Have a look at the program name — is it a real Windows program or something you've never heard of?","Check both the name AND the CPU usage together. What do they tell you?","Is that a program you'd expect to see on any computer? Or does it look out of place?"] },
      { persona:'zara',   msgs:["Hmm — look at the name more carefully! Does it look real? 🤔","Double check that one — name first, then CPU!"] },
      { persona:'marcus', msgs:["Known program but acting weird? Or totally unknown program? Those are different situations.","Think — would you expect to see that program on a normal computer?"] },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // RANSOMWARE
  // ════════════════════════════════════════════════════════════
  ransomware: {
    onLoad_1:[
      { persona:'priya',  msgs:["Files are being locked up across our drives. This could be ransomware 🔒","Ransomware encrypts your files — it scrambles them so you can't open them — then demands money.","File encryption alert! Something is changing file extensions across our drives.","Encrypted means 'scrambled so you can't read it'. Ransomware does this to your files, then asks for money to unscramble them."] },
      { persona:'zara',   msgs:["OH NO — files are getting locked! We need to isolate any infected drives fast!","Ransomware is the worst 😤 It locks all your files and demands payment. Let's find which drives are hit.","Quick — we need to find which drives have weird file extensions before it spreads!"] },
      { persona:'marcus', msgs:["Ransomware alert! Someone's trying to lock all our files for ransom 💰","It's like someone breaking into your house and putting padlocks on all your stuff. Except it's your computer files."] },
    ],
    onLoad_2:[
      { persona:'zara',   msgs:["Read the email, then load the File Integrity Monitor. Quick!","Email → File Integrity Monitor. Check those file extensions!"] },
      { persona:'marcus', msgs:["Email first, then File Integrity Monitor. How many files are changed? ⚡","Read it, load the tool. Every second counts!"] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Look at the 'new extensions' column — what file extension is showing? 👀"] },
      { persona:'priya',  msgs:["Normal files end in .docx, .pdf, .jpg etc. If you see .locked, .encrypted, .WNCRY — that's ransomware. Does this drive have one?"] },
      { persona:'marcus', msgs:["Also check the percentage of files changed. A little bit might be amber. A LOT of files suddenly changed = big red flag 🔴"] },
      { persona:'zara',   msgs:["Heads up: .bak is a backup extension. It sounds scary but it's actually normal for backup drives! The note on the card will tell you more 📋"] },
    ],
    onHalfway:[
      { persona:'marcus', msgs:["Good eye! Remember — the extension AND the number of files together tell you how bad it is."] },
      { persona:'priya',  msgs:["Halfway! If a backup drive shows .bak files, that might actually be fine. Context matters."] },
    ],
    onActionWrong:[
      { persona:'priya',  msgs:["Look at the file extension AND the number of files affected together. Does the combination make sense?","Is that a suspicious extension or a normal one? And how many files have it?","Think about what you'd normally expect on that type of drive — does this fit?"] },
      { persona:'zara',   msgs:["Hmm — check the extension again? Some look scary but are actually normal!","Not quite — what does the note say about that card? 📋"] },
      { persona:'marcus', msgs:["The extension AND how many files — both matter here!","Think: big file change + weird extension = bad. Small change + normal extension = probably fine."] },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // PHISHING IDENTIFIER
  // ════════════════════════════════════════════════════════════
  phishingModule: {
    onLoad_1:[
      { persona:'priya',  msgs:["We've got emails to review. Some are genuine, some are cleverly faked.","Phishing emails pretend to be from real companies to steal your password or money.","The trick is in the sender address. Hackers make tiny changes — one wrong letter, a number instead of a letter.","Every single character in that address matters. Hackers are sneaky!"] },
      { persona:'zara',   msgs:["Oof — dodgy emails incoming 😬 Some of these are definitely fakes.","Phishing = fishing for your personal info using fake emails. Spot the fakes!","Look at every sender address carefully. Even ONE wrong character = fake."] },
      { persona:'marcus', msgs:["Classic phishing setup 🎣 Some of these emails look legit but they're not.","The address is the giveaway. paypa1.com vs paypal.com — can you spot the trick?"] },
    ],
    onLoad_2:[
      { persona:'zara',   msgs:["Email first, then load the Email Header Analyser. Check. Every. Address! 👁️","Read the email — then Email Header Analyser. Look VERY carefully at each sender!"] },
      { persona:'priya',  msgs:["Email → Email Header Analyser. Every character counts — look at the full address.","Open the email, then the analyser. Remember: even one wrong character makes it fake."] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Zoom into the sender address — look at it letter by letter 🔍"] },
      { persona:'marcus', msgs:["Hackers swap letters for similar-looking numbers: 0 for O, 1 for l, rn for m. Can you spot any?"] },
      { persona:'priya',  msgs:["Also check the full domain — is it company.com? Or company.helpdesk.xyz? Or c0mpany.com? The part after the @ symbol is the real address."] },
      { persona:'zara',   msgs:["Ok so like... the real address is after the @. If it says @paypa1.com that's fake — it's a 1 not an l! Got it? 🕵️"] },
    ],
    onHalfway:[
      { persona:'priya',  msgs:["Good progress. Remember: real companies use their own domain. hr@company.com is real. hr@company.gmail.com is NOT."] },
      { persona:'marcus', msgs:["You're getting it! The tiniest change in an address = totally different website."] },
    ],
    onActionWrong:[
      { persona:'priya',  msgs:["Go back and look at every character in that address. Is every single one correct?","Check the domain part — the bit after the @. Is it exactly the right company domain?","Hackers change just one character. Look for: 0 vs O, 1 vs l, extra words, wrong endings."] },
      { persona:'zara',   msgs:["Hmm — read that address again really carefully! Even one wrong letter matters 👀","Check the note at the bottom of the card — it shows you what to look for!"] },
      { persona:'marcus', msgs:["Something's off about that address. Can you spot what the hacker changed?","Read it aloud if it helps. Does it actually match the real company name?"] },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // BRUTE FORCE
  // ════════════════════════════════════════════════════════════
  bruteForce: {
    onLoad_1:[
      { persona:'marcus', msgs:["Someone's hammering our login page with password guesses! 🔑","Password attack! Something's trying to break into accounts by guessing loads of passwords.","A brute force attack is like trying every key on a keyring until one works. But automated and very fast.","Login alert! Loads of attempts on some accounts. This could be a bot trying to crack passwords!"] },
      { persona:'zara',   msgs:["Uh oh — unusual login activity! Might be someone trying to guess their way in 🔐","Brute force = guessing passwords really fast using a computer. Let's see if that's what's happening."] },
      { persona:'priya',  msgs:["Real humans make a few mistakes when typing a password. Bots make thousands of attempts per minute — that's the difference.","Three things to look for: how many attempts, how fast (interval), and how many computers are trying."] },
    ],
    onLoad_2:[
      { persona:'zara',   msgs:["Read the email — then load the Access Attempt Analyser. Check those attempt rates!","Email → Access Attempt Analyser. How fast are those attempts coming in? ⚡"] },
      { persona:'marcus', msgs:["Email first — then Access Attempt Analyser. Attempts per minute is key!","Read it, load the tool. How many attempts? From how many computers?"] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Look at the 'attempts per minute' — how many is too many? 🤔"] },
      { persona:'marcus', msgs:["A real person makes maybe 1-2 mistakes per minute. If you're seeing 300+ attempts per minute, that's definitely a bot!"] },
      { persona:'priya',  msgs:["Also look at the interval — the time between attempts. A robot does it at exactly the same speed every time. A human is random. Very regular = suspicious."] },
      { persona:'zara',   msgs:["And check the note on the card — if an account got locked then suddenly had a successful login, that's a massive red flag! The hacker might have got in 😬"] },
    ],
    onHalfway:[
      { persona:'priya',  msgs:["Good progress. Remember: lots of attempts + very fast + from few computers = brute force attack."] },
      { persona:'marcus', msgs:["Halfway! A handful of attempts spread across many devices = normal humans. 2000/min from 1-2 computers = definitely a bot."] },
    ],
    onActionWrong:[
      { persona:'priya',  msgs:["Check both the number of attempts AND how many different computers they came from.","High attempts from one or two computers = attack. Low attempts spread across loads of devices = normal humans.","What's the interval between attempts? Very regular timing is a bot giveaway."] },
      { persona:'zara',   msgs:["Hmm — look at the attempts per minute! Is that humanly possible? 🤔","The note at the bottom explains the pattern. What does it say?"] },
      { persona:'marcus', msgs:["Think about what a real person does vs what a bot does. Same idea here.","How many different computers? And how fast? Both clues matter!"] },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // SOCIAL ENGINEERING (NEW)
  // ════════════════════════════════════════════════════════════
  socialEng: {
    onLoad_1:[
      { persona:'zara',   msgs:["Someone is pretending to be IT / Microsoft / the boss to trick our staff! 😤","This is social engineering — tricking PEOPLE instead of hacking computers.","Classic con artist stuff! They're trying to get passwords or access by pretending to be someone trustworthy.","Stay sharp — these can be really convincing!"] },
      { persona:'marcus', msgs:["Sneaky attack this one. No hacking needed — just tricks and lies 🎭","A social engineer doesn't need to hack your computer if they can just trick you into giving them access.","This is like a con artist in real life. They play a character to get what they want."] },
      { persona:'priya',  msgs:["Social engineering uses psychology — making you feel urgent, scared or trusting so you act without thinking.","The key tells: urgency ('do it NOW!'), secrecy ('don't tell anyone'), and requests that skip the normal process.","Real IT departments follow proper processes. They have ticket numbers. They don't call out of the blue asking for your password."] },
    ],
    onLoad_2:[
      { persona:'zara',   msgs:["Read the email — then load the Help Desk Log 🎭 Check each request!","Email first, then Help Desk Log. Is each request following the normal process?"] },
      { persona:'priya',  msgs:["Email → Help Desk Log. Look at HOW each request was made, not just what they wanted.","Open the brief, then load the Help Desk Log. Red flags: urgency, secrecy, no ticket number."] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Look at HOW they made the request — did they follow the normal process? 🤔"] },
      { persona:'marcus', msgs:["Ask yourself: would a real IT person / manager / company actually do it this way? Real processes have ticket numbers!"] },
      { persona:'priya',  msgs:["Key question: does this request make someone bypass the normal process? If yes — that's suspicious. Legitimate requests go through proper channels."] },
      { persona:'zara',   msgs:["Real rule: Microsoft NEVER calls you. Your bank NEVER asks for your password by phone. 'Do it NOW and don't tell anyone' = scam every single time 🚩"] },
    ],
    onHalfway:[
      { persona:'priya',  msgs:["Good work. Remember: urgency + secrecy + no ticket = social engineering."] },
      { persona:'marcus', msgs:["Halfway! The golden rule — legit IT never needs your password. If anyone asks: it's a scam."] },
    ],
    onActionWrong:[
      { persona:'priya',  msgs:["Look at HOW the request was made. Did it follow proper process? Was there a ticket number?","Would a real company/IT department actually do it this way? What does normal look like?","Is there something off about the way they're asking — urgency, secrecy, asking for something IT wouldn't normally need?"] },
      { persona:'zara',   msgs:["Hmm — re-read the 'how they asked' column. Does anything seem off? 🎭","Check the note at the bottom of the card! It explains the red flag."] },
      { persona:'marcus', msgs:["Is this something a real, legitimate person would actually do? Or does it feel off?","No ticket number? Calling out of the blue? Asking for a password? Those are big red flags!"] },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // USB DROP ATTACK (NEW)
  // ════════════════════════════════════════════════════════════
  usbDrop: {
    onLoad_1:[
      { persona:'marcus', msgs:["Unknown USB sticks plugged into our computers! This could be a USB drop attack 🔌","Someone might have left infected USB drives around the building on purpose!","A USB drop attack is when hackers leave infected memory sticks for curious people to find and plug in.","Real talk — hackers label these USBs with tempting stuff like \"Bonuses\" or \"Confidential\" so even careful people get curious enough to plug them in!"] },
      { persona:'zara',   msgs:["Ugh — unknown USB sticks showing up 😤 Classic USB drop attack!","Hackers leave USBs in car parks and corridors hoping someone picks them up. Super sneaky!","Found a USB? DON'T plug it in! That's the number one rule 🚫"] },
      { persona:'priya',  msgs:["Watch out for malware that tries to run automatically when a USB is plugged in — or tricks you into clicking something that launches it.","Two big questions for each device: do we know where it came from? And did it try to run any programs automatically?","Even personal USBs from home can accidentally bring malware into work. Company devices only!"] },
    ],
    onLoad_2:[
      { persona:'zara',   msgs:["Read the email, then load the USB Device Log 🔌 Check each device!","Email first — then USB Device Log. Did anything try to autorun?"] },
      { persona:'marcus', msgs:["Email → USB Device Log. Where was the device found and did it autorun? Key questions!","Read it, load the USB Device Log. Unknown + autorun = massive problem."] },
    ],
    onStuck:[
      { persona:'zara',   msgs:["Look at where the device was found AND whether it tried to autorun anything 🔌"] },
      { persona:'marcus', msgs:["Unknown device found outside the building? That's already suspicious. Did it also try to run a program? That's very suspicious."] },
      { persona:'priya',  msgs:["Rule of thumb: if it's a company device with an asset tag, used during work hours, by authorised staff = probably fine. Anything else = investigate or quarantine."] },
      { persona:'zara',   msgs:["Also look at the time! A USB plugged into the finance computer at midnight... when nobody should be there... that's a big red flag regardless of autorun 😬"] },
    ],
    onHalfway:[
      { persona:'priya',  msgs:["Good work! Remember: unknown + autorun = red. Unknown but no autorun = amber (still needs checking). Company device = green."] },
      { persona:'marcus', msgs:["Halfway! The USB's origin matters a lot — found in a car park vs checked out from IT are very different things."] },
    ],
    onActionWrong:[
      { persona:'priya',  msgs:["Look at three things: where it came from, whether it tried to autorun, and who was using it.","Is the device known and authorised? Or did it appear from nowhere?","Even without autorun, an unknown device on a sensitive computer needs investigation."] },
      { persona:'zara',   msgs:["Check the autorun field AND where it was found! Both matter 🔌","Have a look at the note at the bottom of the card — it explains the risk."] },
      { persona:'marcus', msgs:["Found in a car park vs in the IT room — totally different level of risk, right?","Think about who would legitimately connect a USB here and how. Does this fit?"] },
    ],
  },

};

// ── PHISHING EXCEPTION CHAT ────────────────────────────────────
var PHISHING_EXCEPTION_CHAT = {
  // NOTE: no "onPhishingArrived" pool anymore — any proactive nudge before
  // the student decides would give the answer away. They now decide blind,
  // exactly like a real inbox. Reactions only happen AFTER they choose.
  onOpened:[
    { persona:'zara',   msgs:["Oh no — that was a fake! Always check the address before opening 💪 You'll spot it next time!","That was a phishing email! The address had a tiny mistake in it. Now you know what to look for!","Ah, that one got you! The address wasn't quite right. You'll catch the next one!"] },
    { persona:'marcus', msgs:["Sneaky one! That was a fake. Check those addresses next time — you've got the eye for it!","Phishing got you that time — but you'll catch it next time. Look for that one wrong character!","That one was tricky! Even pros get caught sometimes. Check the address closely next time."] },
    { persona:'priya',  msgs:["That one fooled you — the address had one wrong character. You'll spot it next time.","Phishing emails are designed to fool you. The mistake was very small. Check character by character next time.","Good lesson here — that address was almost right, which is exactly what makes phishing so tricky."] },
  ],
  onReported:[
    { persona:'marcus', msgs:["YES! Spotted the fake! You've got a sharp eye! ⭐","Beautiful catch! That's exactly the skill we need! 🎯","You got it! Fake address, reported immediately. That's how it's done! 💪","Great job! Didn't even open it — straight to report!","Well done! That's a real analyst move right there 🕵️"] },
    { persona:'zara',   msgs:["BRILLIANT! Fake address caught and reported! You're on fire! 🏆","Incredible! You didn't get fooled at all! Amazing! 🌟","YES! That's exactly right! Didn't even open it! 🔥","Wow, you caught it straight away! So good! ⭐","Nailed it! That's exactly how to handle a dodgy email! 🙌"] },
    { persona:'priya',  msgs:["Correct. Fake address identified and reported. ✓","Well done. You checked before acting. That's the right approach every time.","Perfect. You spotted the suspicious element and reported it.","Excellent. That's textbook phishing detection.","Right call. Checking the address before opening is exactly the habit to build."] },
  ],
};

// ── IP TRACE CHAT ──────────────────────────────────────────────
var IP_TRACE_CHAT = {
  onStart:[
    { persona:'marcus', msgs:["🚨 RED ALERT! Someone is hacking in RIGHT NOW — track them!","LIVE INTRUDER!! Chase them across the map! 🌍","Oh no — they're IN! Quick, trace where they're connecting from!","LIVE HACK!! Let's gooo — pick the right IP at each location!"] },
    { persona:'zara',   msgs:["Someone's hacking us live! Follow the signal through the map!","Active intrusion! Chase them — pick the correct IP at each hop!","They're bouncing around the world trying to hide. Don't lose them!"] },
    { persona:'priya',  msgs:["Active intrusion detected. Track each relay point — they're trying to hide their real location.","Hackers 'hop' through different countries to make themselves hard to trace. We're tracing them back."] },
  ],
  onHop:[
    { persona:'marcus', msgs:["JUMP! Keep going! 🎯","They moved! Stay on them!","Yes! Next hop!","BOOM! Got that one! 💪","One more down! Nearly there!","Chase them across the globe!","LOCK IT IN! 🔒"] },
    { persona:'zara',   msgs:["Good! Keep tracking! 🌍","Stay focused — next hop!","Don't let them escape!","You're doing amazing!","Keep going! 🔥","Signal acquired — move on!"] },
    { persona:'priya',  msgs:["Signal acquired. Next location.","Keep tracking.","They're trying to lose you.","Next relay point.","Stay on the signal."] },
  ],
  onExtend:[
    { persona:'zara',   msgs:["⚡ They know we're onto them — adding more hops to try and lose us!","Oh they're panicking! More servers, more hops. But we're staying on them!"] },
    { persona:'marcus', msgs:["Clever hacker — but we're cleverer! They've rerouted but we've got the signal! 💻","They added more hops to shake us! Keep going — we've nearly got them!"] },
  ],
  onWin:[
    { persona:'marcus', msgs:["YESSSS!! You traced the hacker all the way! ABSOLUTE LEGEND! 🌍🔒","Every single IP confirmed! Unbelievable work! 🏆","You hunted them across the GLOBE! That was incredible! 🎯"] },
    { persona:'zara',   msgs:["PERFECT TRACE — hacker locked out!! 🌟 That was amazing!","You got every single one! I'm so impressed right now! 🔥"] },
    { persona:'priya',  msgs:["Full trace completed. Excellent work.","Origin located and secured. Outstanding investigative work."] },
  ],
  onLose:[
    { persona:'zara',   msgs:["So close! The IP is shown clearly on the panel — read every digit 👀","Nearly had them! Look at the IP on screen and pick the exact match."] },
    { persona:'marcus', msgs:["Nearly got them! Watch those numbers carefully next time! 💪","You'll nail it next time. Pay close attention to similar-looking IPs!"] },
    { persona:'priya',  msgs:["Focus on the exact IP shown in the panel. Hackers use very similar numbers to confuse you.","Check each number group carefully — the difference is sometimes just one digit."] },
  ],
};



// ── onAllHandled: completion celebrations for each module ──
MODULE_GROUP_CHAT.bruteForce.onAllHandled = [
  { persona:'marcus', msgs:["Every account checked! Locked the bots, cleared the normal ones. That's how it's done! 💪","All accounts assessed — you've got a real eye for bot attacks now!"] },
  { persona:'zara',   msgs:["DONE! You spotted every attack AND left the normal activity alone! So hard to do! 🌟","Amazing work — you're officially a brute force expert! ⭐"] },
  { persona:'priya',  msgs:["Well done. You understood the key difference: speed + few IPs = bot. Low rate + many IPs = human typing errors.","Excellent. You even spotted the edge case where a lock was followed by a successful login. Real analyst thinking."] },
];
MODULE_GROUP_CHAT.socialEng.onAllHandled = [
  { persona:'zara',   msgs:["Every request reviewed — you caught the sneaky ones AND confirmed the real ones! 🎭⭐","Not a single social engineering trick got past you! 🏆"] },
  { persona:'marcus', msgs:["DONE! You just stopped a whole social engineering attack! 💪","Every ticket checked. Every scam spotted. That's the skill!"] },
  { persona:'priya',  msgs:["Well done. You applied the golden rule every time: did this follow proper process?","Social engineering is one of the hardest attacks to spot. You should be really proud."] },
];
MODULE_GROUP_CHAT.usbDrop.onAllHandled = [
  { persona:'marcus', msgs:["All USB devices checked! Dodgy ones quarantined, safe ones cleared! 🔌🏆","Every single device assessed — that's exactly how a USB security check should go! 💪"] },
  { persona:'zara',   msgs:["Not a single risky USB got past you! 🌟","You checked every device AND spotted the suspicious ones. Brilliant work! ⭐"] },
  { persona:'priya',  msgs:["Perfect. Authorised ones cleared, suspicious ones flagged. Textbook response.","You applied the key rules consistently: origin + auto-run + timing. Great work."] },
];
