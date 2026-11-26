// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-50a1500e5eee.js');self.addEventListener('install',()=>self.skipWaiting());