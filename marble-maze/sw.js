// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e84450f35ae0.js');self.addEventListener('install',()=>self.skipWaiting());