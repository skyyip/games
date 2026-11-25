// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6e4d622298d9.js');self.addEventListener('install',()=>self.skipWaiting());