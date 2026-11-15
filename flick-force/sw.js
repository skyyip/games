// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8627225a6c37.js');self.addEventListener('install',()=>self.skipWaiting());