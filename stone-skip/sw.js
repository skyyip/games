// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6bd2932b22aa.js');self.addEventListener('install',()=>self.skipWaiting());