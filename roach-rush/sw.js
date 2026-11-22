// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-23aa07b013e3.js');self.addEventListener('install',()=>self.skipWaiting());