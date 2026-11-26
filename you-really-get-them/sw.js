// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4f05b02f63f3.js');self.addEventListener('install',()=>self.skipWaiting());