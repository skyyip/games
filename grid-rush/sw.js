// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-925b4cb04439.js');self.addEventListener('install',()=>self.skipWaiting());