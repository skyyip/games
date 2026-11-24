// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2fbefc86fc94.js');self.addEventListener('install',()=>self.skipWaiting());