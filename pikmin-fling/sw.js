// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9f8558dfefc4.js');self.addEventListener('install',()=>self.skipWaiting());