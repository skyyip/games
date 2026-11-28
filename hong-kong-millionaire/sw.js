// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2d792404bfed.js');self.addEventListener('install',()=>self.skipWaiting());