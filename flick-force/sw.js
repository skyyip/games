// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-dce1d2069918.js');self.addEventListener('install',()=>self.skipWaiting());