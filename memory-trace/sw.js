// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8952f01972d2.js');self.addEventListener('install',()=>self.skipWaiting());