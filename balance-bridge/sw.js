// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ed38cc6867b.js');self.addEventListener('install',()=>self.skipWaiting());