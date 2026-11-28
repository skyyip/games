// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69e3d140e7a0.js');self.addEventListener('install',()=>self.skipWaiting());