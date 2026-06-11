/* ================================================================
   LOADER.JS v5 — CyberShield Academy
   Update version strings here when upgrading any file.
   Load order: three → globe → sounds → gamification → modules → chatData → engine
   ================================================================ */
var GAME_FILES = {
  three:        'three.min.js',
  globe:        'globe.js',
  sounds:       'sounds.js',
  gamification: 'gamification.js',
  modules:      'modules.js',
  chatData:     'chat-data.js',
  engine:       'engine.js',
};
var _queue=['three','globe','sounds','gamification','modules','chatData','engine'],_qi=0;
function _next(){if(_qi>=_queue.length)return;var s=document.createElement('script');s.src=GAME_FILES[_queue[_qi++]];s.onload=_next;document.head.appendChild(s);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_next);}else{_next();}
