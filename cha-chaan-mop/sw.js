// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0a4782fda24a.js');self.addEventListener('install',()=>self.skipWaiting());