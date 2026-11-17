// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-75be294a20b7.js');self.addEventListener('install',()=>self.skipWaiting());