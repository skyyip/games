// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f34afccb9b4a.js');self.addEventListener('install',()=>self.skipWaiting());