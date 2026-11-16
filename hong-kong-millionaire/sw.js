// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-32cfb42280a8.js');self.addEventListener('install',()=>self.skipWaiting());