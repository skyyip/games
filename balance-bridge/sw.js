// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-54a99629b32d.js');self.addEventListener('install',()=>self.skipWaiting());