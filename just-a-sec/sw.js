// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4a255d254937.js');self.addEventListener('install',()=>self.skipWaiting());