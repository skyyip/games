// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a092e771abee.js');self.addEventListener('install',()=>self.skipWaiting());