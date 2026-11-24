// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-423893a388ae.js');self.addEventListener('install',()=>self.skipWaiting());