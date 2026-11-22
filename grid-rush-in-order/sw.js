// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9c544afa6cb8.js');self.addEventListener('install',()=>self.skipWaiting());