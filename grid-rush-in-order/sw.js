// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6682ba281669.js');self.addEventListener('install',()=>self.skipWaiting());