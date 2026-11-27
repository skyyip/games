// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b9a66d7e902.js');self.addEventListener('install',()=>self.skipWaiting());