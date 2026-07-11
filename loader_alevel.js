/* ════════════════════════════════════════════════════════════
   CYBERSHIELD: ANALYST EDITION
   FILE: loader_alevel.js
   ROLE: File loader — points to A-Level content variants
   ════════════════════════════════════════════════════════════ */

var GAME_FILES = {
  sounds:       'sounds.js',
  gamification: 'gamification_alevel.js',
  modules:      'modules_alevel.js',
  chatData:     'chat-data_alevel.js',
  engine:       'engine_alevel.js',
};

// ── Sequential script loader ──────────────────────────────────
(function(){
  var keys = Object.keys(GAME_FILES);
  var idx  = 0;

  function loadNext(){
    if(idx >= keys.length){ if(typeof _boot === 'function') _boot(); return; }
    var k   = keys[idx++];
    var src = GAME_FILES[k];
    var s   = document.createElement('script');
    s.src   = src;
    s.onerror = function(){
      var b = document.getElementById('__errbox');
      if(b){ b.style.display='block'; b.textContent += 'LOAD ERROR: ' + src + ' not found.\n\n'; }
      loadNext(); // continue loading remaining files even if one fails
    };
    s.onload = loadNext;
    document.head.appendChild(s);
  }

  loadNext();
})();
