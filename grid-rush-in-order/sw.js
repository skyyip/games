// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-283f02273a54.js');self.addEventListener('install',()=>self.skipWaiting());