// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-be8ce93d2fb5.js');self.addEventListener('install',()=>self.skipWaiting());