// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3faf67ce3ba3.js');self.addEventListener('install',()=>self.skipWaiting());