/* ================================================================
   GLOBE_2026-06-10_V1.JS — Three.js IP Trace Globe
   Requires: three.min.js loaded first
   Exposes: flashHop, startMapPulse, stopMapPulse,
            drawTacticalMapIdle, TRACER (animId property)
   ================================================================ */
(function(){
'use strict';
if(typeof THREE==='undefined'){
  console.error('CyberShield Globe: THREE not found — check three.min.js is loaded');
  return;
}

const R = 1.82; // globe radius

/* ── STATE ────────────────────────────────────────────────── */
const G={
  scene:null,camera:null,renderer:null,
  globe:null,dots:null,arcs:null,pulses:null,
  clock:null,animId:null,ready:false,
  prevPos:null,curPos:null,targetQ:null,
  rotating:false,pulsing:false,pulseRings:[],
};

/* Expose as TRACER so engine.js references (TRACER.animId etc.) work */
window.TRACER = G;

/* ── LAT/LON → 3D VECTOR ─────────────────────────────────── */
function ll(lat,lon,r){
  const phi  =(90-lat)*Math.PI/180;
  const theta=(lon+180)*Math.PI/180;
  return new THREE.Vector3(
    -Math.sin(phi)*Math.cos(theta)*r,
     Math.cos(phi)*r,
     Math.sin(phi)*Math.sin(theta)*r
  );
}

/* ── INIT ─────────────────────────────────────────────────── */
function initGlobe(){
  const el=document.getElementById('ipGlobeContainer');
  if(!el)return;
  if(G.ready){resetGlobe();return;}
  const W=el.clientWidth||520, H=el.clientHeight||360;

  G.scene   = new THREE.Scene();
  G.clock   = new THREE.Clock();
  G.camera  = new THREE.PerspectiveCamera(42,W/H,0.1,200);
  G.camera.position.set(0,0.3,5.4);

  G.renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
  G.renderer.setSize(W,H);
  G.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  G.renderer.setClearColor(0x000810);
  el.appendChild(G.renderer.domElement);

  _stars(); _sphere(); _grid(); _atmosphere(); _cityDots(); _lights();

  G.dots   = new THREE.Group(); G.scene.add(G.dots);
  G.arcs   = new THREE.Group(); G.scene.add(G.arcs);
  G.pulses = new THREE.Group(); G.scene.add(G.pulses);
  G.ready  = true;
  window.addEventListener('resize',_resize);
  _loop();
}

function _stars(){
  const p=[];
  for(let i=0;i<1400;i++){
    const r=45+Math.random()*25;
    const t=Math.random()*Math.PI*2;
    const f=Math.acos(2*Math.random()-1);
    p.push(r*Math.sin(f)*Math.cos(t),r*Math.cos(f),r*Math.sin(f)*Math.sin(t));
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  G.scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:0.055,transparent:true,opacity:0.65})));
}

function _sphere(){
  G.globe=new THREE.Mesh(
    new THREE.SphereGeometry(R,64,64),
    new THREE.MeshPhongMaterial({color:0x001220,emissive:0x000c1a,shininess:18,transparent:true,opacity:0.97})
  );
  G.scene.add(G.globe);
}

function _grid(){
  const pts=[];
  const seg=(a,b)=>pts.push(a,b);
  // Latitude lines
  for(let lat=-60;lat<=60;lat+=30){
    let prev=null;
    for(let lon=0;lon<=360;lon+=5){const v=ll(lat,lon%360,R+0.005);if(prev)seg(prev,v);prev=v;}
  }
  // Longitude lines
  for(let lon=0;lon<360;lon+=30){
    let prev=null;
    for(let lat=-90;lat<=90;lat+=5){const v=ll(lat,lon,R+0.005);if(prev)seg(prev,v);prev=v;}
  }
  const g=new THREE.BufferGeometry().setFromPoints(pts);
  G.scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x004422,transparent:true,opacity:0.42})));
}

function _atmosphere(){
  G.scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(R+0.07,32,32),
    new THREE.MeshBasicMaterial({color:0x00ff88,side:THREE.BackSide,transparent:true,opacity:0.055})
  ));
}

function _cityDots(){
  if(typeof CITIES==='undefined')return;
  CITIES.forEach(c=>{
    const m=new THREE.Mesh(
      new THREE.SphereGeometry(0.011,6,6),
      new THREE.MeshBasicMaterial({color:0x003a14,transparent:true,opacity:0.55})
    );
    m.position.copy(ll(c.lat,c.lon,R+0.014));
    G.globe.add(m); // rotate with globe
  });
}

function _lights(){
  G.scene.add(new THREE.AmbientLight(0x001533,2.2));
  const d=new THREE.DirectionalLight(0x00ffaa,0.5);
  d.position.set(6,4,5);
  G.scene.add(d);
}

/* ── RENDER LOOP ────────────────────────────────────────────── */
function _loop(){
  G.animId=requestAnimationFrame(_loop);
  const dt=G.clock.getDelta();

  if(!G.rotating){
    G.globe.rotation.y+=0.0008;
    _sync();
  }
  if(G.rotating&&G.targetQ){
    G.globe.quaternion.slerp(G.targetQ,dt*3.0);
    _sync();
    if(G.globe.quaternion.angleTo(G.targetQ)<0.007){
      G.globe.quaternion.copy(G.targetQ);_sync();G.rotating=false;
    }
  }
  if(G.pulsing)_tickPulse(dt);
  G.renderer.render(G.scene,G.camera);
}

function _sync(){
  G.dots.quaternion.copy(G.globe.quaternion);
  G.arcs.quaternion.copy(G.globe.quaternion);
  G.pulses.quaternion.copy(G.globe.quaternion);
}

/* ── PULSE RINGS ────────────────────────────────────────────── */
function startMapPulse(){
  if(!G.ready||!G.curPos)return;
  G.pulsing=true;
  for(let i=0;i<3;i++) _mkRing(i/3);
}

function stopMapPulse(){
  G.pulsing=false;
  G.pulseRings.forEach(r=>{if(r.mesh)G.pulses.remove(r.mesh);});
  G.pulseRings=[];
}

function _mkRing(phase){
  const mat=new THREE.MeshBasicMaterial({color:0xff3300,transparent:true,opacity:0.9,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.RingGeometry(0.05,0.09,24),mat);
  if(G.curPos){
    mesh.position.copy(G.curPos);
    const outDir=G.curPos.clone().multiplyScalar(2);
    mesh.lookAt(outDir);
  }
  G.pulses.add(mesh);
  G.pulseRings.push({mesh,t:phase});
}

function _tickPulse(dt){
  G.pulseRings.forEach(r=>{
    r.t=(r.t+dt*0.75)%1;
    r.mesh.scale.setScalar(1+r.t*3.8);
    r.mesh.material.opacity=Math.max(0,0.85*(1-r.t));
  });
}

/* ── DOT & ARC ──────────────────────────────────────────────── */
function _dot(lat,lon,color,emissive,r){
  const pos=ll(lat,lon,R+0.04);
  const mesh=new THREE.Mesh(
    new THREE.SphereGeometry(r,10,10),
    new THREE.MeshPhongMaterial({color,emissive,shininess:80})
  );
  mesh.position.copy(pos);
  G.dots.add(mesh);
  return pos;
}

function _arc(p1,p2,color){
  const pts=[];
  for(let i=0;i<=52;i++){
    const t=i/52;
    const v=new THREE.Vector3().lerpVectors(p1,p2,t);
    v.normalize().multiplyScalar(R+0.04+Math.sin(t*Math.PI)*0.38);
    pts.push(v);
  }
  const g=new THREE.BufferGeometry().setFromPoints(pts);
  G.arcs.add(new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:0.82})));
}

/* ── FLASH HOP (called by engine.js) ────────────────────────── */
function flashHop(hop,first,onDone){
  if(!G.ready)initGlobe();

  // Update info panel immediately
  document.getElementById('ipCurrentIP').textContent=hop.ip;
  document.getElementById('ipCurrentCity').textContent='📍 '+hop.city+', '+hop.country;
  try{SFX.sonar();}catch(e){}

  const isFinal=window.GS&&GS.ip&&GS.ip.hops&&(hop===GS.ip.hops[GS.ip.hops.length-1]);
  const newPos=_dot(
    hop.lat,hop.lon,
    isFinal?0xff3300:0x00ff41,
    isFinal?0x991100:0x007722,
    isFinal?0.068:0.046
  );

  if(G.prevPos) _arc(G.prevPos,newPos,isFinal?0xff8800:0x00f5ff);
  G.prevPos=newPos.clone();
  G.curPos =newPos.clone();

  // Rotate globe to bring hop to face camera (+Z axis)
  const dir=newPos.clone().normalize();
  G.targetQ=new THREE.Quaternion().setFromUnitVectors(dir,new THREE.Vector3(0,0,1));
  G.rotating=true;

  setTimeout(()=>{if(onDone)onDone();},660);
}

/* ── drawTacticalMapIdle — engine.js calls this on overlay open ─ */
function drawTacticalMapIdle(){
  initGlobe();
  resetGlobe();
  // _loop() is already running after initGlobe()
}

/* ── RESET BETWEEN TRACES ───────────────────────────────────── */
function resetGlobe(){
  stopMapPulse();
  if(G.dots)  while(G.dots.children.length)   G.dots.remove(G.dots.children[0]);
  if(G.arcs)  while(G.arcs.children.length)   G.arcs.remove(G.arcs.children[0]);
  G.prevPos=null;G.curPos=null;G.rotating=false;
}

/* ── RESIZE ─────────────────────────────────────────────────── */
function _resize(){
  const c=document.getElementById('ipGlobeContainer');
  if(!c||!G.ready)return;
  const W=c.clientWidth,H=c.clientHeight;
  G.camera.aspect=W/H;G.camera.updateProjectionMatrix();
  G.renderer.setSize(W,H);
}

/* ── GLOBALS FOR ENGINE.JS ──────────────────────────────────── */
window.flashHop          = flashHop;
window.startMapPulse     = startMapPulse;
window.stopMapPulse      = stopMapPulse;
window.drawTacticalMapIdle = drawTacticalMapIdle;
window.initGlobe         = initGlobe;
window.resetGlobe        = resetGlobe;

})();
