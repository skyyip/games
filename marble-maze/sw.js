// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-882bf5cde465.js');self.addEventListener('install',()=>self.skipWaiting());