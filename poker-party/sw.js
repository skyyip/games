// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c26cfc84fb7.js');self.addEventListener('install',()=>self.skipWaiting());