// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3701a591c481.js');self.addEventListener('install',()=>self.skipWaiting());