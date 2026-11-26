// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6fd12e18c91f.js');self.addEventListener('install',()=>self.skipWaiting());