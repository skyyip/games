// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-864daf17b045.js');self.addEventListener('install',()=>self.skipWaiting());