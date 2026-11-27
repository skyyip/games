// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-08e092478f36.js');self.addEventListener('install',()=>self.skipWaiting());