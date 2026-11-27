// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f6d263f00018.js');self.addEventListener('install',()=>self.skipWaiting());