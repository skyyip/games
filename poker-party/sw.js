// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b571d140f3c2.js');self.addEventListener('install',()=>self.skipWaiting());