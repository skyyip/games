// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9de77cc3fd33.js');self.addEventListener('install',()=>self.skipWaiting());