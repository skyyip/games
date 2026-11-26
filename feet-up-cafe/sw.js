// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-273ee3a26a14.js');self.addEventListener('install',()=>self.skipWaiting());