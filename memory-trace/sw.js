// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-71dd4f95785b.js');self.addEventListener('install',()=>self.skipWaiting());