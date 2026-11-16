// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2aa2cebb3a17.js');self.addEventListener('install',()=>self.skipWaiting());