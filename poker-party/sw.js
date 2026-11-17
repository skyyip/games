// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-597d84f10d3b.js');self.addEventListener('install',()=>self.skipWaiting());