// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6a620c25e5ba.js');self.addEventListener('install',()=>self.skipWaiting());