// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-20af721e95f5.js');self.addEventListener('install',()=>self.skipWaiting());