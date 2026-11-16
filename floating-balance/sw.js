// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-208eaeb2683e.js');self.addEventListener('install',()=>self.skipWaiting());