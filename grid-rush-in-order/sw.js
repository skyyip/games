// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-58bb6a19b887.js');self.addEventListener('install',()=>self.skipWaiting());