// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba399b587428.js');self.addEventListener('install',()=>self.skipWaiting());