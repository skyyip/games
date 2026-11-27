// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ce416171615.js');self.addEventListener('install',()=>self.skipWaiting());