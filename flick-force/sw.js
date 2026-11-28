// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-027b9f972004.js');self.addEventListener('install',()=>self.skipWaiting());