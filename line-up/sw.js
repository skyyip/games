// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74d59e27c728.js');self.addEventListener('install',()=>self.skipWaiting());