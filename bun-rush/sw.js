// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-015c2acc31d3.js');self.addEventListener('install',()=>self.skipWaiting());