// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80fb9a4b8956.js');self.addEventListener('install',()=>self.skipWaiting());