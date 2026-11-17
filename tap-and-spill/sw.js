// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ee3d35cd234b.js');self.addEventListener('install',()=>self.skipWaiting());