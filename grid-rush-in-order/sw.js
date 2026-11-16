// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0d8844746212.js');self.addEventListener('install',()=>self.skipWaiting());