// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1cca13bfa780.js');self.addEventListener('install',()=>self.skipWaiting());