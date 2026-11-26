// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2517077d69ca.js');self.addEventListener('install',()=>self.skipWaiting());