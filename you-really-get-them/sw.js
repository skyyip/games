// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-010a49f05ef9.js');self.addEventListener('install',()=>self.skipWaiting());