// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ce202fa780a.js');self.addEventListener('install',()=>self.skipWaiting());