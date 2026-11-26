// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-be4de2f389cf.js');self.addEventListener('install',()=>self.skipWaiting());