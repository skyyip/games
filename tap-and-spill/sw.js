// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-48faf21cb79a.js');self.addEventListener('install',()=>self.skipWaiting());