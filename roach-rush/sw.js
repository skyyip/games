// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-349e05aa5b2b.js');self.addEventListener('install',()=>self.skipWaiting());