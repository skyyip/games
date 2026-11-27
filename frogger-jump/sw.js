// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12f57f62a33a.js');self.addEventListener('install',()=>self.skipWaiting());