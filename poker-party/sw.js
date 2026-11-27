// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-642e882c6ef0.js');self.addEventListener('install',()=>self.skipWaiting());