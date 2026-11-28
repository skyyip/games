// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-662b2a84c907.js');self.addEventListener('install',()=>self.skipWaiting());