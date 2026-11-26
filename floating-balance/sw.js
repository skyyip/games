// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f0a138ba78ba.js');self.addEventListener('install',()=>self.skipWaiting());