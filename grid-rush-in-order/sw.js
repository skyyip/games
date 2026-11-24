// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-575f0372dd71.js');self.addEventListener('install',()=>self.skipWaiting());