// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c37f9882f58.js');self.addEventListener('install',()=>self.skipWaiting());