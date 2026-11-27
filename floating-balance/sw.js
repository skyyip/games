// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8c42ad4ca37e.js');self.addEventListener('install',()=>self.skipWaiting());