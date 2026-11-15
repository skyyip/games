// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e0a490e66be2.js');self.addEventListener('install',()=>self.skipWaiting());