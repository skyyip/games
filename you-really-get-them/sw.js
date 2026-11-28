// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e83dc41a2bc.js');self.addEventListener('install',()=>self.skipWaiting());