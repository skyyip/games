// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ec203bbf7cfc.js');self.addEventListener('install',()=>self.skipWaiting());