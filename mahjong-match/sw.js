// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-85dd90cbf7a5.js');self.addEventListener('install',()=>self.skipWaiting());