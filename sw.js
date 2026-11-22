// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e1d1d68548f1.js');self.addEventListener('install',()=>self.skipWaiting());