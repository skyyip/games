// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6f08594c8746.js');self.addEventListener('install',()=>self.skipWaiting());