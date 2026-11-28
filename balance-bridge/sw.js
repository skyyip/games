// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b76d5d0a0df.js');self.addEventListener('install',()=>self.skipWaiting());