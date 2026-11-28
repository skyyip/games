// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d79a963f164d.js');self.addEventListener('install',()=>self.skipWaiting());