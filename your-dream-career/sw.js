// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-be718aa12f24.js');self.addEventListener('install',()=>self.skipWaiting());