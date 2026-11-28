// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7133661fc6b8.js');self.addEventListener('install',()=>self.skipWaiting());