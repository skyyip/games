// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0620b76c44c5.js');self.addEventListener('install',()=>self.skipWaiting());