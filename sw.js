// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f85705bafe53.js');self.addEventListener('install',()=>self.skipWaiting());