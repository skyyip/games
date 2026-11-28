// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-360697ea6f20.js');self.addEventListener('install',()=>self.skipWaiting());