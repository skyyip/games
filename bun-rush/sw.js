// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-38ded24627b2.js');self.addEventListener('install',()=>self.skipWaiting());