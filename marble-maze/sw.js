// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5540f03bec10.js');self.addEventListener('install',()=>self.skipWaiting());