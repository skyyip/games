// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fbd6ae736dc1.js');self.addEventListener('install',()=>self.skipWaiting());