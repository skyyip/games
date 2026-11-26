// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79192214be31.js');self.addEventListener('install',()=>self.skipWaiting());