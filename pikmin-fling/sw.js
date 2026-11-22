// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8b34ae146926.js');self.addEventListener('install',()=>self.skipWaiting());