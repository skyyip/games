// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e51d051df44a.js');self.addEventListener('install',()=>self.skipWaiting());