// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80cf2c180ea3.js');self.addEventListener('install',()=>self.skipWaiting());