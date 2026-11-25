// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-42f81092704b.js');self.addEventListener('install',()=>self.skipWaiting());