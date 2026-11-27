// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2549e1c79191.js');self.addEventListener('install',()=>self.skipWaiting());