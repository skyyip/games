// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-175932aeb76f.js');self.addEventListener('install',()=>self.skipWaiting());