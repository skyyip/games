// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8e2f1553cfc2.js');self.addEventListener('install',()=>self.skipWaiting());