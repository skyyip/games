// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-deefb1df01db.js');self.addEventListener('install',()=>self.skipWaiting());