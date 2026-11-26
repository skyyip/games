// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4a06b726c510.js');self.addEventListener('install',()=>self.skipWaiting());