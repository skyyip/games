// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-525df39929bc.js');self.addEventListener('install',()=>self.skipWaiting());