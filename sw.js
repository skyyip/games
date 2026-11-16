// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79a0c1cde59b.js');self.addEventListener('install',()=>self.skipWaiting());