// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e885fe809a6f.js');self.addEventListener('install',()=>self.skipWaiting());