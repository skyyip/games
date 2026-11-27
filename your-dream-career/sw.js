// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7a06b5e60aec.js');self.addEventListener('install',()=>self.skipWaiting());