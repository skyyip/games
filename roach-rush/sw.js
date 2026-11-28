// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-323054ad9b7d.js');self.addEventListener('install',()=>self.skipWaiting());