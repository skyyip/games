// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1c350851a5b3.js');self.addEventListener('install',()=>self.skipWaiting());