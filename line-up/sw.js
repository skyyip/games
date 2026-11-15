// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30059f427384.js');self.addEventListener('install',()=>self.skipWaiting());