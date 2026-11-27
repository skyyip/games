// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7b77cd414e86.js');self.addEventListener('install',()=>self.skipWaiting());