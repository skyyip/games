// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7cbe9da3dff6.js');self.addEventListener('install',()=>self.skipWaiting());