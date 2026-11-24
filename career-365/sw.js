// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e0d9b458bfb0.js');self.addEventListener('install',()=>self.skipWaiting());