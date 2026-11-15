// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e1ff0e8161d.js');self.addEventListener('install',()=>self.skipWaiting());