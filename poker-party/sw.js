// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b343673306fd.js');self.addEventListener('install',()=>self.skipWaiting());