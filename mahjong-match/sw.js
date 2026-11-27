// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8e6d27650941.js');self.addEventListener('install',()=>self.skipWaiting());