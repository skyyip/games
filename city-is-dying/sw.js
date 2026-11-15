// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5bbf1563e79c.js');self.addEventListener('install',()=>self.skipWaiting());