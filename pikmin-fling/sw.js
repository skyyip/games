// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f084623039da.js');self.addEventListener('install',()=>self.skipWaiting());