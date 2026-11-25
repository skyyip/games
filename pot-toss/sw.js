// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b96b944195a.js');self.addEventListener('install',()=>self.skipWaiting());