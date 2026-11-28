// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3604f70a1508.js');self.addEventListener('install',()=>self.skipWaiting());