// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d01d28a2b022.js');self.addEventListener('install',()=>self.skipWaiting());