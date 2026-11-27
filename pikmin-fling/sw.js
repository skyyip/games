// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ff41d9411954.js');self.addEventListener('install',()=>self.skipWaiting());