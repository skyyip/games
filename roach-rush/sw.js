// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fe3b713d8d5f.js');self.addEventListener('install',()=>self.skipWaiting());