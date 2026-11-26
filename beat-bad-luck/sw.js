// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c4b94d29721.js');self.addEventListener('install',()=>self.skipWaiting());