// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-77a30b4b192f.js');self.addEventListener('install',()=>self.skipWaiting());