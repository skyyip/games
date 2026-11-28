// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4ceac1758bf9.js');self.addEventListener('install',()=>self.skipWaiting());