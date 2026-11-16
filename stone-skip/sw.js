// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ef0482d1ac9e.js');self.addEventListener('install',()=>self.skipWaiting());