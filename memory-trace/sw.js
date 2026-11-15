// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5cb7c4e1b102.js');self.addEventListener('install',()=>self.skipWaiting());