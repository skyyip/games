// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3eca0f35f2eb.js');self.addEventListener('install',()=>self.skipWaiting());