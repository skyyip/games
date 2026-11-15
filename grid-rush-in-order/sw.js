// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e3db599b71da.js');self.addEventListener('install',()=>self.skipWaiting());