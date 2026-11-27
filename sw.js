// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69e85a922254.js');self.addEventListener('install',()=>self.skipWaiting());