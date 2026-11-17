// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22d1da5deb97.js');self.addEventListener('install',()=>self.skipWaiting());