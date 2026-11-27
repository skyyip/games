// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f05609e0fdc.js');self.addEventListener('install',()=>self.skipWaiting());