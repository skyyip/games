// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-82ab991f9d43.js');self.addEventListener('install',()=>self.skipWaiting());