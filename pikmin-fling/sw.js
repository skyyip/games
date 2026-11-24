// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3cc54c95a70d.js');self.addEventListener('install',()=>self.skipWaiting());