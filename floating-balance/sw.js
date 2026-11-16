// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-617d666cb943.js');self.addEventListener('install',()=>self.skipWaiting());