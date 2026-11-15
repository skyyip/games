// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-432efca38557.js');self.addEventListener('install',()=>self.skipWaiting());