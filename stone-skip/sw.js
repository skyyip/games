// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-887829959927.js');self.addEventListener('install',()=>self.skipWaiting());