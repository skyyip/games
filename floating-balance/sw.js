// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e1dff4adae4.js');self.addEventListener('install',()=>self.skipWaiting());