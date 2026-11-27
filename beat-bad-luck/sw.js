// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d7dfd35c797.js');self.addEventListener('install',()=>self.skipWaiting());