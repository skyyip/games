// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ea91461005c1.js');self.addEventListener('install',()=>self.skipWaiting());