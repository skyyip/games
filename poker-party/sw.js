// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8eb04ec18fc3.js');self.addEventListener('install',()=>self.skipWaiting());