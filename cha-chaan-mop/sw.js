// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d14ff40c32a5.js');self.addEventListener('install',()=>self.skipWaiting());