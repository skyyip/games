// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c15d5957863.js');self.addEventListener('install',()=>self.skipWaiting());