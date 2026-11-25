// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-39384d630307.js');self.addEventListener('install',()=>self.skipWaiting());