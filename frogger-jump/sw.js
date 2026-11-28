// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e8ee7aeb7168.js');self.addEventListener('install',()=>self.skipWaiting());