// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1cb05836214a.js');self.addEventListener('install',()=>self.skipWaiting());