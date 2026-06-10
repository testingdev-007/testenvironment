// ============================================================
// SOUNDS.JS — CyberShield Academy Audio Engine v3
// Professional workplace sounds + mission-control ambience
// ============================================================

const SFX = (() => {
  let ctx = null;
  let _bgMaster = null;
  let _bgNodes  = [];
  let _bgActive = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Primitive helpers ─────────────────────────────────────
  function tone(freq, type, vol, attack, sustain, release, offset=0) {
    const c=getCtx(), t=c.currentTime+offset;
    const o=c.createOscillator(), g=c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type=type; o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol, t+attack);
    g.gain.setValueAtTime(vol, t+attack+sustain);
    g.gain.linearRampToValueAtTime(0, t+attack+sustain+release);
    o.start(t); o.stop(t+attack+sustain+release+0.02);
  }
  function noise(vol, dur, offset=0) {
    const c=getCtx(), t=c.currentTime+offset;
    const buf=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const src=c.createBufferSource(), g=c.createGain();
    src.buffer=buf; src.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(vol,t); g.gain.linearRampToValueAtTime(0,t+dur);
    src.start(t); src.stop(t+dur+0.02);
  }

  return {

    // ── UI sounds ─────────────────────────────────────────
    chatPing()  { try{ tone(1046,'sine',0.07,0.005,0.04,0.12); tone(1318,'sine',0.04,0.005,0.02,0.10,0.04); }catch(e){} },
    keyClick()  { try{ noise(0.04,0.025); tone(220,'square',0.025,0.002,0.005,0.02); }catch(e){} },
    btnClick()  { try{ tone(783,'sine',0.06,0.005,0.03,0.08); }catch(e){} },
    correct()   { try{ tone(523,'sine',0.09,0.008,0.06,0.15); tone(783,'sine',0.09,0.008,0.08,0.18,0.14); }catch(e){} },
    wrong()     { try{ tone(180,'sine',0.12,0.005,0.08,0.18); noise(0.04,0.12); }catch(e){} },
    newMail()   { try{ tone(523,'sine',0.07,0.008,0.05,0.12); tone(659,'sine',0.07,0.008,0.06,0.14,0.10); }catch(e){} },
    xpGain()    { try{ tone(1046,'sine',0.07,0.005,0.04,0.12); }catch(e){} },
    tick()      { try{ noise(0.06,0.03); tone(440,'square',0.03,0.002,0.01,0.025); }catch(e){} },
    alert()     { try{ [0,0.22,0.44].forEach(dt=>{ tone(880,'sine',0.10,0.005,0.08,0.06,dt); tone(660,'sine',0.06,0.005,0.06,0.05,dt+0.10); }); }catch(e){} },

    // ── Sonar ping ─────────────────────────────────────────
    sonar() {
      try {
        const c=getCtx(),t=c.currentTime;
        const o=c.createOscillator(),g=c.createGain();
        o.connect(g);g.connect(c.destination);o.type='sine';
        o.frequency.setValueAtTime(1200,t); o.frequency.exponentialRampToValueAtTime(300,t+0.55);
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+0.7);
        o.start(t);o.stop(t+0.75);
        const o2=c.createOscillator(),g2=c.createGain();
        o2.connect(g2);g2.connect(c.destination);o2.type='sine';
        o2.frequency.setValueAtTime(1200,t+0.35); o2.frequency.exponentialRampToValueAtTime(300,t+0.9);
        g2.gain.setValueAtTime(0,t+0.35); g2.gain.linearRampToValueAtTime(0.08,t+0.37); g2.gain.exponentialRampToValueAtTime(0.001,t+1.0);
        o2.start(t+0.35);o2.stop(t+1.05);
      }catch(e){}
    },

    // ── Professional confirm/deny ───────────────────────────
    win() {
      try {
        tone(523,'sine',0.10,0.01,0.08,0.15);
        tone(659,'sine',0.10,0.01,0.08,0.15,0.18);
        tone(783,'sine',0.12,0.01,0.14,0.22,0.36);
      }catch(e){}
    },
    lose() {
      try {
        tone(523,'sine',0.09,0.01,0.10,0.18);
        tone(392,'sine',0.09,0.01,0.12,0.22,0.22);
      }catch(e){}
    },

    // ── Mission-control background music ───────────────────
    // Looping ambient track: bass drone + rhythmic pulse + tension string
    bgStart() {
      try {
        if(_bgActive) return;
        _bgActive=true;
        const c=getCtx();
        _bgNodes.forEach(n=>{ try{n.stop&&n.stop();}catch(e){} });
        _bgNodes=[];

        // Master gain (fade in)
        const master=c.createGain();
        master.gain.setValueAtTime(0,c.currentTime);
        master.gain.linearRampToValueAtTime(1,c.currentTime+2.5);
        master.connect(c.destination);
        _bgMaster=master;

        // Bass drone — low sawtooth through lowpass
        const bass=c.createOscillator();
        const bFilt=c.createBiquadFilter();
        const bGain=c.createGain();
        bass.type='sawtooth'; bass.frequency.value=55;
        bFilt.type='lowpass'; bFilt.frequency.value=130; bFilt.Q.value=1;
        bGain.gain.value=0.18;
        bass.connect(bFilt); bFilt.connect(bGain); bGain.connect(master);
        bass.start(); _bgNodes.push(bass);

        // Rhythmic pulse — LFO amplitude-modulating a mid tone
        const mid=c.createOscillator();
        const midGain=c.createGain();
        const lfo=c.createOscillator();
        const lfoGain=c.createGain();
        mid.type='square'; mid.frequency.value=110;
        midGain.gain.value=0;
        lfo.type='sine'; lfo.frequency.value=2.2;
        lfoGain.gain.value=0.045;
        lfo.connect(lfoGain); lfoGain.connect(midGain.gain);
        mid.connect(midGain); midGain.connect(master);
        mid.start(); lfo.start();
        _bgNodes.push(mid,lfo);

        // Tension string — very slow tremolo
        const str=c.createOscillator();
        const strGain=c.createGain();
        const strLfo=c.createOscillator();
        const strLfoGain=c.createGain();
        str.type='sine'; str.frequency.value=329; // E4
        strGain.gain.value=0;
        strLfo.type='sine'; strLfo.frequency.value=0.4;
        strLfoGain.gain.value=0.018;
        strLfo.connect(strLfoGain); strLfoGain.connect(strGain.gain);
        str.connect(strGain); strGain.connect(master);
        str.start(); strLfo.start();
        _bgNodes.push(str,strLfo);

        // Second harmony — slow detune
        const har=c.createOscillator();
        const harGain=c.createGain();
        har.type='sine'; har.frequency.value=220; // A3
        harGain.gain.value=0.025;
        har.connect(harGain); harGain.connect(master);
        har.start(); _bgNodes.push(har);
      }catch(e){}
    },

    bgIntensify() {
      // Speeds up pulse, raises tension string — for final hops / low timer
      try {
        if(!_bgActive||!_bgNodes.length) return;
        const c=getCtx();
        const lfo=_bgNodes[2]; // mid LFO
        if(lfo&&lfo.frequency) lfo.frequency.linearRampToValueAtTime(4.0,c.currentTime+1.5);
        const str=_bgNodes[4]; // string
        if(str&&str.frequency) str.frequency.linearRampToValueAtTime(440,c.currentTime+2.0);
      }catch(e){}
    },

    bgStop() {
      try {
        if(!_bgActive) return;
        _bgActive=false;
        if(_bgMaster){
          const c=getCtx();
          _bgMaster.gain.linearRampToValueAtTime(0,c.currentTime+1.5);
          setTimeout(()=>{ _bgNodes.forEach(n=>{try{n.stop&&n.stop();}catch(e){}});_bgNodes=[]; },1600);
        }
      }catch(e){}
    },

    // Unlock audio context on first user gesture
    unlock() { try{ getCtx(); }catch(e){} },
  };
})();

// Global click/key hooks
document.addEventListener('keydown', e => {
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'){
    if(e.key.length===1||e.key==='Backspace') SFX.keyClick();
  }
});
document.addEventListener('click', e => {
  const btn=e.target.closest('button,.ipeasy,.edb-btn,.brep');
  if(btn) SFX.btnClick();
});
