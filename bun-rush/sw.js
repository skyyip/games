// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-00831857aa02.js');self.addEventListener('install',()=>self.skipWaiting());