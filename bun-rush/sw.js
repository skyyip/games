// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93adbdde9d0e.js');self.addEventListener('install',()=>self.skipWaiting());