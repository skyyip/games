// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-51c65f4ac704.js');self.addEventListener('install',()=>self.skipWaiting());