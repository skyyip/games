// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4d9d5475d193.js');self.addEventListener('install',()=>self.skipWaiting());