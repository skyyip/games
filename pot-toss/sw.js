// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5365ec33b565.js');self.addEventListener('install',()=>self.skipWaiting());