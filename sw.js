// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-03370e89914a.js');self.addEventListener('install',()=>self.skipWaiting());