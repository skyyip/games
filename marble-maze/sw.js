// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e07361daa75a.js');self.addEventListener('install',()=>self.skipWaiting());