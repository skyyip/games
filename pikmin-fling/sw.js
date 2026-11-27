// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2fbc76c7c494.js');self.addEventListener('install',()=>self.skipWaiting());