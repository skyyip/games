// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-76d2eec7213a.js');self.addEventListener('install',()=>self.skipWaiting());