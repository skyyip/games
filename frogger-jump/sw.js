// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-41bea045e19b.js');self.addEventListener('install',()=>self.skipWaiting());