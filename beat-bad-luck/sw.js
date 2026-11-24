// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2eefe557044f.js');self.addEventListener('install',()=>self.skipWaiting());