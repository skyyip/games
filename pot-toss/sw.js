// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1cfbd213e061.js');self.addEventListener('install',()=>self.skipWaiting());