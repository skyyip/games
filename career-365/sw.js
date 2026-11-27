// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57c30259ec80.js');self.addEventListener('install',()=>self.skipWaiting());