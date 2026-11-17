// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-97bae61e0451.js');self.addEventListener('install',()=>self.skipWaiting());