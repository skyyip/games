// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-96bf80972448.js');self.addEventListener('install',()=>self.skipWaiting());