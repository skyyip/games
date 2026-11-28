// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-90dd3ec3c1ab.js');self.addEventListener('install',()=>self.skipWaiting());