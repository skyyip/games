// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-91f50b1740f7.js');self.addEventListener('install',()=>self.skipWaiting());