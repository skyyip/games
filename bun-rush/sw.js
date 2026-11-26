// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-65a80dc75f44.js');self.addEventListener('install',()=>self.skipWaiting());