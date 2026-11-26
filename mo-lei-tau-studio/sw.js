// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1554700011bf.js');self.addEventListener('install',()=>self.skipWaiting());