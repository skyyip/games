// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c01220c544f.js');self.addEventListener('install',()=>self.skipWaiting());