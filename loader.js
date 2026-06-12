/* ================================================================
   LOADER.JS v7 — CyberShield Academy
   To use Natural Earth GeoJSON instead of built-in polygons:
   - Download ne_110m_land.geojson from naturalearthdata.com
   - Wrap contents: const WORLD_GEOJSON = <paste here>;
   - Save as worldmap-geo.js in same folder
   - Add 'worldmapGeo':'worldmap-geo.js' below, before 'engine'
   ================================================================ */
var GAME_FILES = {
  sounds:       'sounds.js',
  gamification: 'gamification.js',
  worldmap:     'worldmap_geo.js',
  modules:      'modules.js',
  chatData:     'chat-data.js',
  engine:       'engine.js',
};
var _queue=['sounds','gamification','worldmap','modules','chatData','engine'],_qi=0;
function _next(){if(_qi>=_queue.length)return;var s=document.createElement('script');s.src=GAME_FILES[_queue[_qi++]];s.onload=_next;document.head.appendChild(s);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_next);}else{_next();}
