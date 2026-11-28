// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f3e626ab8c73.js');self.addEventListener('install',()=>self.skipWaiting());