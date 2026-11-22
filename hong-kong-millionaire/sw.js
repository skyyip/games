// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69308c1c6d19.js');self.addEventListener('install',()=>self.skipWaiting());