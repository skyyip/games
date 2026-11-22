// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-91261bbac400.js');self.addEventListener('install',()=>self.skipWaiting());