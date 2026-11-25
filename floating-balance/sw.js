// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-002f9cab8b6c.js');self.addEventListener('install',()=>self.skipWaiting());