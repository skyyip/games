// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5b3a15d20e15.js');self.addEventListener('install',()=>self.skipWaiting());