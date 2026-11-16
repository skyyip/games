// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4dee4aa75e68.js');self.addEventListener('install',()=>self.skipWaiting());