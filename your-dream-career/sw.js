// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0566c9f7e667.js');self.addEventListener('install',()=>self.skipWaiting());