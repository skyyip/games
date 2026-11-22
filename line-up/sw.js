// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a6305be09108.js');self.addEventListener('install',()=>self.skipWaiting());