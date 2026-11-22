// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5fa995bdf31c.js');self.addEventListener('install',()=>self.skipWaiting());