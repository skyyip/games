// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1dd05ea92085.js');self.addEventListener('install',()=>self.skipWaiting());