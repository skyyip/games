// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e56831fb4fab.js');self.addEventListener('install',()=>self.skipWaiting());