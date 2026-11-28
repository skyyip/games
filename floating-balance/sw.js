// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8478660c45aa.js');self.addEventListener('install',()=>self.skipWaiting());