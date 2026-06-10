// ============================================================
// CHAT-DATA.JS — CyberShield Academy v8
// Short. Varied. Age 9. Colleagues watching you work.
// ============================================================

const PERSONAS = {
  zara:   { id:'zara',   name:'Zara K.' },
  marcus: { id:'marcus', name:'Marcus T.' },
  priya:  { id:'priya',  name:'Priya S.' },
};

// ── GENERAL ───────────────────────────────────────────────────
const GENERAL_GROUP_CHAT = {
  welcome: [
    { persona:'zara', msgs:[
      "Hey! Ready to catch some hackers? 🕵️",
      "Welcome! Hit the green button when you're set.",
      "Good to have you! Click the button above to start.",
      "Hi! We'll be right here watching. Hit the button!",
      "Hey there! The inbox is waiting for you 👆",
    ]},
    { persona:'marcus', msgs:[
      "Yooo! New agent! Let's gooo 🚀",
      "YES! Another detective on the team!",
      "Hype. Ready? Hit that button! 💪",
      "Let's see what chaos is waiting for us 😄",
      "LETS GO! Click the green button! 🔥",
    ]},
    { persona:'priya', msgs:[
      "Hi. We're watching how you do. No pressure. 🙂",
      "Systems ready. Hit the button when you are.",
      "Let's see what you've got.",
      "We set this up to test you. Should be fun.",
    ]},
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

// ── GLOBAL EVENT POOLS (all modules) ─────────────────────────
// These are used for any event that doesn't need module-specific context.
// Big pools = less repetition.

const GLOBAL_CHAT = {

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

const MODULE_GROUP_CHAT = {

  ddos: {
    onLoad_1:[
      {persona:'marcus', msgs:["Our website's getting slammed with traffic 📈 Could be an attack!","Traffic alert! Something's flooding the network.","Huge spike in visitors — way more than normal. Weird.","Network's going crazy right now. Check it out!"]},
      {persona:'zara',   msgs:["Heads up — we're seeing unusual traffic. Could be nothing, could be a DDoS.","Traffic's way up. Might be an attack, might be legit. Needs checking."]},
    ],
    onLoad_2:[
      {persona:'zara',   msgs:["Read your email, then load the Network Traffic Monitor ☝️","Open the email first. Then pick the right tool above."]},
      {persona:'priya',  msgs:["Email first. Then Network Traffic Monitor. Go.","Read the email, load your tool. You know what to do."]},
    ],
    onActionWrong:[
      {persona:'marcus', msgs:["Is that traffic level really bad, a bit much, or totally fine? 🤔","Look at the number — how many times higher than normal is it?","Think: is that a lot above normal, a bit above, or about right?"]},
      {persona:'zara',   msgs:["Compare it to the average. Is the difference huge, moderate, or tiny?","The multiple is the key. Is it way over, a bit over, or normal?"]},
    ],
  },

  malware: {
    onLoad_1:[
      {persona:'zara',   msgs:["Something weird's running on one of our computers 😬","Suspicious program flagged on the network. Could be malware.","Odd process showing up. Might be something hiding on the system.","Unknown program detected. Time to investigate!"]},
      {persona:'marcus', msgs:["Ooh we've got a sneaky one. Something's hiding on a machine 🕵️","Bad software alert! Something dodgy might be running on a computer."]},
    ],
    onLoad_2:[
      {persona:'marcus', msgs:["Read the email, then grab the Process Monitor. Let's see what's running!","Email first — then Process Monitor. Find the dodgy one!"]},
      {persona:'zara',   msgs:["Open your email. Then load the Process Monitor ☝️","Read the email. Tool: Process Monitor. Go find it!"]},
    ],
    onActionWrong:[
      {persona:'zara',   msgs:["Look at the program NAME — is it something you'd expect to see on a computer?","Is that a real Windows program? Or does the name look odd?","Name + CPU together — what do they tell you?"]},
      {persona:'priya',  msgs:["Unknown name? Familiar name acting strangely? Those mean different things.","Think about whether you'd expect to see that program name on a computer."]},
    ],
  },

  ransomware: {
    onLoad_1:[
      {persona:'priya',  msgs:["Files are being locked up on our drives. This is serious 🔒","Encryption alert — files are changing to weird extensions.","Something's scrambling our files. Could be ransomware.","File drives are acting very strange. We need to check now."]},
      {persona:'zara',   msgs:["Files are getting encrypted — that's really bad. Check it quickly!","Unusual file activity. Some drives might be under attack."]},
    ],
    onLoad_2:[
      {persona:'zara',   msgs:["Read the email, then load the File Integrity Monitor. Quick!","Email first. Then File Integrity Monitor. Every second counts here!"]},
      {persona:'marcus', msgs:["Email → File Integrity Monitor. Go go go! ⚡","Read it, then load the File Integrity Monitor. Fast!"]},
    ],
    onActionWrong:[
      {persona:'priya',  msgs:["Look at how many files are affected and what extension they've got.","Is that a lot of files changed, a few, or none? And what does the extension mean?","Think: is this a normal file type, or something you'd never normally see?"]},
      {persona:'zara',   msgs:["What does that file extension tell you? Have you seen it before?","Check the number of encrypted files — is it a lot, a little, or totally normal?"]},
    ],
  },

  phishingModule: {
    onLoad_1:[
      {persona:'priya',  msgs:["Got a batch of emails — some real, some fake. Spot the fakes 🔍","Phishing alert. Some of these emails aren't what they look like.","Suspicious emails landed. Some are genuine, some are traps.","Email batch in. One or more might be phishing attempts."]},
      {persona:'zara',   msgs:["Dodgy emails to review. Check every sender address carefully.","Some of these are fake. The clues are in the addresses."]},
    ],
    onLoad_2:[
      {persona:'zara',   msgs:["Read your email, then load the Email Header Analyser. Check each address!","Email first. Then the Email Header Analyser. Look very carefully at each address 👁️"]},
      {persona:'priya',  msgs:["Email → Email Header Analyser. Every letter matters.","Read the brief. Then load the Email Header Analyser. Go."]},
    ],
    onActionWrong:[
      {persona:'priya',  msgs:["Look at every single character in that address. Every. Single. One.","Is that address exactly right? Check for swapped letters or numbers.","Hackers often swap one letter for a number. Can you spot it?"]},
      {persona:'zara',   msgs:["Read the address letter by letter. Is it the real company's address?","Compare it to what you'd expect. Even one wrong character = fake."]},
    ],
  },

  bruteForce: {
    onLoad_1:[
      {persona:'marcus', msgs:["Someone's computer is hammering our login page with password guesses! 🔑","Password attack! Something's trying to break into accounts really fast.","Login alert! Loads of password attempts on some accounts — could be an attack!","Uh oh — our login monitor flagged something. Looks like a password guessing attack."]},
      {persona:'zara',   msgs:["Unusual login activity detected. Might be someone trying to crack passwords.","Something's trying to guess its way into our accounts. Let's check it out."]},
    ],
    onLoad_2:[
      {persona:'zara',   msgs:["Read your email, then load the Access Attempt Analyser. Check how fast the attempts are!","Email first — then pick the Access Attempt Analyser. Look at the numbers!"]},
      {persona:'marcus', msgs:["Email → Access Attempt Analyser. How many attempts? From how many computers? Go!","Read the brief, load the Access Attempt Analyser. Is it a robot or a human typing?"]},
    ],
    onActionWrong:[
      {persona:'marcus', msgs:["Think — could a human actually type that fast? 🤔","Look at the attempts per minute AND how many IPs. What do those numbers tell you?","Is the timing random like a human, or super regular like a robot?"]},
      {persona:'zara',   msgs:["Check the interval — is it perfectly regular? That's the robot giveaway.","Look at both the speed AND the number of source IPs together.","A few IPs + very fast + regular timing = not a human. Does this match?"]},
    ],
  },

};

// ── PHISHING EXCEPTION CHAT ────────────────────────────────────
const PHISHING_EXCEPTION_CHAT = {
  onPhishingArrived:[
    {persona:'priya', msgs:["Hold on — check that sender address before you do anything 👀"]},
    {persona:'zara',  msgs:["Wait — look very carefully at who sent that. Does it look exactly right?"]},
    {persona:'marcus',msgs:["Ooh... look at that email address carefully before you click anything! 🔍"]},
  ],
  onOpened:[
    {persona:'zara',  msgs:["Oh no — that was a fake email! Always check the address first. You'll get it next time! 💪"]},
    {persona:'marcus',msgs:["Sneaky one! That was a phishing email in disguise. Check those addresses next time!"]},
    {persona:'priya', msgs:["That one fooled you. The address had a tiny mistake. You'll spot it next time."]},
  ],
  onReported:[
    {persona:'marcus',msgs:["YES! Spotted the fake! You're sharp! ⭐","You caught it! That's the eye we need! 🎯"]},
    {persona:'zara',  msgs:["Brilliant — fake address, reported immediately. That's exactly right! 🏆","Great spotting! You didn't get fooled. Excellent! 🌟"]},
    {persona:'priya', msgs:["Correct. Fake address caught. ✓","You got it. Nice work."]},
  ],
};

// ── IP TRACE CHAT ──────────────────────────────────────────────
const IP_TRACE_CHAT = {
  onStart:[
    {persona:'marcus', msgs:["🚨 RED ALERT! Someone is hacking in RIGHT NOW — track them!","INTRUDER!! Chase them across the map! 🌍","Oh no — they're IN! Quick, find where they're connecting from!","LIVE HACK!! Let's go — trace their location!"]},
    {persona:'zara',   msgs:["Someone's hacking us live! Follow them through the map!","Active intrusion! Chase them — pick the right IP at each hop!"]},
    {persona:'priya',  msgs:["Active intrusion. Track each location as they jump.","Hacker detected. Follow the signal — pick each IP."]},
  ],
  onHop:[
    {persona:'marcus', msgs:["JUMP! Keep going! 🎯","They moved! Stay on them!","Yes! Next one!","BOOM! Got that hop! 💪","One more down!","Chase them!"]},
    {persona:'zara',   msgs:["Good! Keep tracking!","Stay focused — next hop!","Don't let them get away!","Keep going!"]},
    {persona:'priya',  msgs:["Signal acquired. Next.","Keep tracking.","They're trying to lose you.","Next location."]},
  ],
  onWin:[
    {persona:'marcus', msgs:["YESSS!! You tracked the hacker! LEGEND! 🌍🔒","Every IP confirmed! Outstanding! 🏆","You hunted them across the GLOBE! INCREDIBLE! 🎯"]},
    {persona:'zara',   msgs:["Perfect trace — hacker locked out! 🌟","You got every single one. Impressive!"]},
  ],
  onLose:[
    {persona:'zara',   msgs:["So close! Watch the IP panel — it shows the number clearly.","The IP is right there on screen — read it carefully!"]},
    {persona:'marcus', msgs:["Nearly got them! Watch those numbers! 💪","You'll get them next time!"]},
  ],
};
