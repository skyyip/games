// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-41f3a733d50f.js');self.addEventListener('install',()=>self.skipWaiting());