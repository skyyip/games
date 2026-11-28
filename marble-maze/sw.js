// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7ae468483af.js');self.addEventListener('install',()=>self.skipWaiting());