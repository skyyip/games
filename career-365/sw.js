// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81f7f168f620.js');self.addEventListener('install',()=>self.skipWaiting());