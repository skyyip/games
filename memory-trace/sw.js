// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-caa6fe4f9b10.js');self.addEventListener('install',()=>self.skipWaiting());