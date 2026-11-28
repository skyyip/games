// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-baafc372c23a.js');self.addEventListener('install',()=>self.skipWaiting());