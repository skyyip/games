// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b4a14be70bc0.js');self.addEventListener('install',()=>self.skipWaiting());