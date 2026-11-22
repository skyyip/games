// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3c3bfebe4562.js');self.addEventListener('install',()=>self.skipWaiting());