// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7fb14ca0e4f9.js');self.addEventListener('install',()=>self.skipWaiting());