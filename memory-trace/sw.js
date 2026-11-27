// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ae3f47abeac.js');self.addEventListener('install',()=>self.skipWaiting());