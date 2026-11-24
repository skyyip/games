// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0331d6128b2f.js');self.addEventListener('install',()=>self.skipWaiting());