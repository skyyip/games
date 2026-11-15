// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8b781d529d4e.js');self.addEventListener('install',()=>self.skipWaiting());