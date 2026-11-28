// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9c4f01c0441f.js');self.addEventListener('install',()=>self.skipWaiting());