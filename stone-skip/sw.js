// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d9a212d387cd.js');self.addEventListener('install',()=>self.skipWaiting());