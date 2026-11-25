// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9ac3233b1061.js');self.addEventListener('install',()=>self.skipWaiting());