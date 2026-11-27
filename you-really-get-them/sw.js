// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-25e4eb536585.js');self.addEventListener('install',()=>self.skipWaiting());