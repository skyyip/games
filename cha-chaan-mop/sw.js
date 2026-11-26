// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2ec6d7cdacd7.js');self.addEventListener('install',()=>self.skipWaiting());