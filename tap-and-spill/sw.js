// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-24003a1626c0.js');self.addEventListener('install',()=>self.skipWaiting());