// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7940f62c314e.js');self.addEventListener('install',()=>self.skipWaiting());