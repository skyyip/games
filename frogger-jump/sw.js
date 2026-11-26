// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e08ab9ead8f8.js');self.addEventListener('install',()=>self.skipWaiting());