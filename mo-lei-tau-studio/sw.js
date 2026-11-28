// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fa53920afa6f.js');self.addEventListener('install',()=>self.skipWaiting());