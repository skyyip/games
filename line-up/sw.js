// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-11e92521de16.js');self.addEventListener('install',()=>self.skipWaiting());