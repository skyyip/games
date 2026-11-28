// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18b0e908dc19.js');self.addEventListener('install',()=>self.skipWaiting());