// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-05621f9afde8.js');self.addEventListener('install',()=>self.skipWaiting());