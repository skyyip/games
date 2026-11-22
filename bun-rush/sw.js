// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1bbf9489a37a.js');self.addEventListener('install',()=>self.skipWaiting());