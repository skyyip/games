// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-323a973d5bd0.js');self.addEventListener('install',()=>self.skipWaiting());