// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-96316b6d48ba.js');self.addEventListener('install',()=>self.skipWaiting());