/* ════════════════════════════════════════════════════════════
   CYBERSHIELD ACADEMY
   FILE: loader_2026-06-10_v28.js
   ROLE: loader.js
   ════════════════════════════════════════════════════════════ */
/* loader v28 */
var GAME_FILES={sounds:'sounds.js',
                gamification:'gamification.js',
                modules:'modules.js',
                chatData:'chat-data.js',
                engine:'engine.js'};
var _queue=['sounds','gamification','modules','chatData','engine'],_qi=0;
function _next(){if(_qi>=_queue.length)return;var s=document.createElement('script');s.src=GAME_FILES[_queue[_qi++]];s.onload=_next;s.onerror=function(){var b=document.getElementById('__errbox');if(b){b.style.display='block';b.textContent+='FAILED TO LOAD: '+s.src+'\n';}console.error('FAILED TO LOAD:',s.src);};document.head.appendChild(s);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_next);}else{_next();}
