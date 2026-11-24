// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-961248a52cfd.js');self.addEventListener('install',()=>self.skipWaiting());