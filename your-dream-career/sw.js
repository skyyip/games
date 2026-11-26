// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e2e3e03368de.js');self.addEventListener('install',()=>self.skipWaiting());