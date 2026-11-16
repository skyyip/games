// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d084217e045.js');self.addEventListener('install',()=>self.skipWaiting());