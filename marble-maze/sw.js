// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f49ca22f052f.js');self.addEventListener('install',()=>self.skipWaiting());