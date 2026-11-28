// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2bbf464dea6b.js');self.addEventListener('install',()=>self.skipWaiting());