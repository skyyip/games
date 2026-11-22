// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c8983a5063d.js');self.addEventListener('install',()=>self.skipWaiting());