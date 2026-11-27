// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb4b240b9155.js');self.addEventListener('install',()=>self.skipWaiting());