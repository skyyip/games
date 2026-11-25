// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-576cdda808f8.js');self.addEventListener('install',()=>self.skipWaiting());