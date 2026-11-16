// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a5c094defde.js');self.addEventListener('install',()=>self.skipWaiting());