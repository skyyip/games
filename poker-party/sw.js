// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-55677c542bef.js');self.addEventListener('install',()=>self.skipWaiting());