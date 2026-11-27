// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5fb2aed8fa12.js');self.addEventListener('install',()=>self.skipWaiting());