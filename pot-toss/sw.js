// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-064066e0a11e.js');self.addEventListener('install',()=>self.skipWaiting());