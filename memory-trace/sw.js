// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ff77554fbadd.js');self.addEventListener('install',()=>self.skipWaiting());