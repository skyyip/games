// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0d6d2aa75908.js');self.addEventListener('install',()=>self.skipWaiting());