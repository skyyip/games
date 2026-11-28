// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cd08824bff7a.js');self.addEventListener('install',()=>self.skipWaiting());