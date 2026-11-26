// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37e659eed486.js');self.addEventListener('install',()=>self.skipWaiting());