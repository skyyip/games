// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-401799a19c51.js');self.addEventListener('install',()=>self.skipWaiting());