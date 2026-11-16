// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89bb8cb42060.js');self.addEventListener('install',()=>self.skipWaiting());