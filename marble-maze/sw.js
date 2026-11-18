// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fe805336352d.js');self.addEventListener('install',()=>self.skipWaiting());