// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0230d2ab9665.js');self.addEventListener('install',()=>self.skipWaiting());