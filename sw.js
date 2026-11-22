// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9920879642ff.js');self.addEventListener('install',()=>self.skipWaiting());