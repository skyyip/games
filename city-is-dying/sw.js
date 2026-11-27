// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-62e7c464cebd.js');self.addEventListener('install',()=>self.skipWaiting());