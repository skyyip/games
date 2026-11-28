// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5f629a7d54a5.js');self.addEventListener('install',()=>self.skipWaiting());