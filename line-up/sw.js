// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d0c683b122d.js');self.addEventListener('install',()=>self.skipWaiting());