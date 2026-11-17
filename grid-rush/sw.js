// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1351995ccd99.js');self.addEventListener('install',()=>self.skipWaiting());