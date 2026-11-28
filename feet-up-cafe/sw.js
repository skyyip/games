// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ce4fdcb58d8.js');self.addEventListener('install',()=>self.skipWaiting());