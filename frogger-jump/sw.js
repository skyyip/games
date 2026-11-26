// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15ba4c566302.js');self.addEventListener('install',()=>self.skipWaiting());