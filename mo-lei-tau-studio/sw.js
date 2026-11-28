// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b2075defc2d.js');self.addEventListener('install',()=>self.skipWaiting());