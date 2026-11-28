// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1ac0c884027f.js');self.addEventListener('install',()=>self.skipWaiting());