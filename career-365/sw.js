// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5270f56a1c48.js');self.addEventListener('install',()=>self.skipWaiting());