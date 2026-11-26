// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6df13badcaf4.js');self.addEventListener('install',()=>self.skipWaiting());