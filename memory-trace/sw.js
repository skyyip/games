// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-282a95cb455f.js');self.addEventListener('install',()=>self.skipWaiting());