// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5b5dcc3a2c6f.js');self.addEventListener('install',()=>self.skipWaiting());