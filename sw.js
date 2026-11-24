// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ab47c57d5afe.js');self.addEventListener('install',()=>self.skipWaiting());