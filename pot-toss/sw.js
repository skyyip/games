// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-764a16f5f44a.js');self.addEventListener('install',()=>self.skipWaiting());