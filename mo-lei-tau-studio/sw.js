// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9942085ebbe4.js');self.addEventListener('install',()=>self.skipWaiting());