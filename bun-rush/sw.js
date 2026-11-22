// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-563e05313216.js');self.addEventListener('install',()=>self.skipWaiting());