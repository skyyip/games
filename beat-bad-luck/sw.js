// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6a2e557e6729.js');self.addEventListener('install',()=>self.skipWaiting());