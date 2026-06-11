/* ================================================================
   LOADER.JS v2 — CyberShield Academy
   Single source of truth for all file versions.
   Update version strings here when upgrading any file.
   ================================================================ */

var GAME_FILES = {
  sounds:        'sounds.js',
  gamification:  'gamification.js',
  modules:       'modules.js',
  chatData:      'chat-data.js',
  engine:        'engine.js',
};

/* Load scripts sequentially — each waits for the previous */
var _queue = ['sounds', 'gamification', 'modules', 'chatData', 'engine'];
var _qi    = 0;
function _nextScript(){
  if(_qi >= _queue.length) return;
  var s   = document.createElement('script');
  s.src   = GAME_FILES[_queue[_qi++]];
  s.onload = _nextScript;
  document.head.appendChild(s);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', _nextScript);
} else {
  _nextScript();
}
