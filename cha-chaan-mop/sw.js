// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15a929cd087d.js');self.addEventListener('install',()=>self.skipWaiting());