// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-29ad52d2eda8.js');self.addEventListener('install',()=>self.skipWaiting());