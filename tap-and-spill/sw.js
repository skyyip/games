// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-42989dd786b0.js');self.addEventListener('install',()=>self.skipWaiting());