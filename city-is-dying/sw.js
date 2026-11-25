// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6223a856f947.js');self.addEventListener('install',()=>self.skipWaiting());