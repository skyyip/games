// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba23adf02cdb.js');self.addEventListener('install',()=>self.skipWaiting());