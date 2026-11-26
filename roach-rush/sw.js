// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-55a30364ab07.js');self.addEventListener('install',()=>self.skipWaiting());