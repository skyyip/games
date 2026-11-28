// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-365633644f1c.js');self.addEventListener('install',()=>self.skipWaiting());