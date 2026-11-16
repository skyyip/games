// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-35cbf5b93280.js');self.addEventListener('install',()=>self.skipWaiting());