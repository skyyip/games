// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-475ca9f0f5c2.js');self.addEventListener('install',()=>self.skipWaiting());