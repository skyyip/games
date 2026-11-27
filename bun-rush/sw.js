// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f36adf6f99e5.js');self.addEventListener('install',()=>self.skipWaiting());