// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-521b36ad37ad.js');self.addEventListener('install',()=>self.skipWaiting());