// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-28460916fd25.js');self.addEventListener('install',()=>self.skipWaiting());