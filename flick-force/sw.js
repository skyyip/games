// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e486032efab9.js');self.addEventListener('install',()=>self.skipWaiting());