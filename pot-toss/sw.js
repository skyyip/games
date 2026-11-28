// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cd5dadec3345.js');self.addEventListener('install',()=>self.skipWaiting());