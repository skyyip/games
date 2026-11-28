// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22a4fab2073c.js');self.addEventListener('install',()=>self.skipWaiting());