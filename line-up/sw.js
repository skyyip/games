// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d18c33713d08.js');self.addEventListener('install',()=>self.skipWaiting());