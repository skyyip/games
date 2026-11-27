// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53b975017d97.js');self.addEventListener('install',()=>self.skipWaiting());