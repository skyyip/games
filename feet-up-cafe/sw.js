// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1962e3d77863.js');self.addEventListener('install',()=>self.skipWaiting());