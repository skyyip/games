// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9cc6486a28fb.js');self.addEventListener('install',()=>self.skipWaiting());