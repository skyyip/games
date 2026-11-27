// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9435ad4ff2d6.js');self.addEventListener('install',()=>self.skipWaiting());