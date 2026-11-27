// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-648f6643d41a.js');self.addEventListener('install',()=>self.skipWaiting());