// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2985d53903ba.js');self.addEventListener('install',()=>self.skipWaiting());