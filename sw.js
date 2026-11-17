// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7a03a402ba8a.js');self.addEventListener('install',()=>self.skipWaiting());