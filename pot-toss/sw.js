// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-464a858af3ff.js');self.addEventListener('install',()=>self.skipWaiting());