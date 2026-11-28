// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37a2fe7392c4.js');self.addEventListener('install',()=>self.skipWaiting());