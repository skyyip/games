// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40ebdbf05fa4.js');self.addEventListener('install',()=>self.skipWaiting());