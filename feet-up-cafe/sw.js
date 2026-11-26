// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4b984b74c59c.js');self.addEventListener('install',()=>self.skipWaiting());