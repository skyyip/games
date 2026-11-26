// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-191055683be1.js');self.addEventListener('install',()=>self.skipWaiting());