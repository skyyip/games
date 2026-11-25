// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-023a33cb8118.js');self.addEventListener('install',()=>self.skipWaiting());