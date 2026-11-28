// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e727709c8cb.js');self.addEventListener('install',()=>self.skipWaiting());