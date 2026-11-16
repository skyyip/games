// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ef1df34f9a01.js');self.addEventListener('install',()=>self.skipWaiting());