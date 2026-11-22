// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7de3f5807bf9.js');self.addEventListener('install',()=>self.skipWaiting());