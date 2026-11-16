// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b1877450b92d.js');self.addEventListener('install',()=>self.skipWaiting());