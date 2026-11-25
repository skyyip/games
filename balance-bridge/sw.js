// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8d8189be3041.js');self.addEventListener('install',()=>self.skipWaiting());