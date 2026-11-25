// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-33edc4911dda.js');self.addEventListener('install',()=>self.skipWaiting());