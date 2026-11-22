// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-dd7499f51221.js');self.addEventListener('install',()=>self.skipWaiting());