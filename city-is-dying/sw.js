// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-41f039aecc93.js');self.addEventListener('install',()=>self.skipWaiting());