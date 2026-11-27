// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-681f1f622109.js');self.addEventListener('install',()=>self.skipWaiting());