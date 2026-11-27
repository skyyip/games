// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b7fd62a6624.js');self.addEventListener('install',()=>self.skipWaiting());