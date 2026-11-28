// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-504a27c182d1.js');self.addEventListener('install',()=>self.skipWaiting());