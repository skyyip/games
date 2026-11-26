// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b7955246869.js');self.addEventListener('install',()=>self.skipWaiting());