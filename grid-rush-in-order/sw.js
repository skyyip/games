// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-834412b2abcd.js');self.addEventListener('install',()=>self.skipWaiting());