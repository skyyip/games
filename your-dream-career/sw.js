// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-90b4a2900d43.js');self.addEventListener('install',()=>self.skipWaiting());