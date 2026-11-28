// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-216854a2f799.js');self.addEventListener('install',()=>self.skipWaiting());