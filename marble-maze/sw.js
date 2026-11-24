// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-008e1715aa4a.js');self.addEventListener('install',()=>self.skipWaiting());