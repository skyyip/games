// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-33d6d77c7d31.js');self.addEventListener('install',()=>self.skipWaiting());