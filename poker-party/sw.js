// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-41fbc678b683.js');self.addEventListener('install',()=>self.skipWaiting());