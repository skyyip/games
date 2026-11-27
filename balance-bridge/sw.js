// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-713d7e0ce6c0.js');self.addEventListener('install',()=>self.skipWaiting());