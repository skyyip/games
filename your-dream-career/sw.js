// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-389828bd6091.js');self.addEventListener('install',()=>self.skipWaiting());