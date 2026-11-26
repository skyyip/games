// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-26e319bc5b47.js');self.addEventListener('install',()=>self.skipWaiting());