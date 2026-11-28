// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb895ed60570.js');self.addEventListener('install',()=>self.skipWaiting());