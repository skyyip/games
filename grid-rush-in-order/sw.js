// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-863cb615206d.js');self.addEventListener('install',()=>self.skipWaiting());