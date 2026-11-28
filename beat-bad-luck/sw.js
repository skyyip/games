// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-639c2601daa6.js');self.addEventListener('install',()=>self.skipWaiting());