// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-17669deb646f.js');self.addEventListener('install',()=>self.skipWaiting());