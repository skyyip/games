// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2219d1b7589c.js');self.addEventListener('install',()=>self.skipWaiting());