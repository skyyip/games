// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b26d7562bbf.js');self.addEventListener('install',()=>self.skipWaiting());