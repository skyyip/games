// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22ef3dc240af.js');self.addEventListener('install',()=>self.skipWaiting());