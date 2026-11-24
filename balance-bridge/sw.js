// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f46be90dc14.js');self.addEventListener('install',()=>self.skipWaiting());