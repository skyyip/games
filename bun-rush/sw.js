// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9afe27d0bb92.js');self.addEventListener('install',()=>self.skipWaiting());