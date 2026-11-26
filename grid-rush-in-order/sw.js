// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9dff08f561a1.js');self.addEventListener('install',()=>self.skipWaiting());