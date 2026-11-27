// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-55f0c933c16e.js');self.addEventListener('install',()=>self.skipWaiting());