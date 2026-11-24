// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7c08c3afaddf.js');self.addEventListener('install',()=>self.skipWaiting());