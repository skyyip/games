// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-556737a79cad.js');self.addEventListener('install',()=>self.skipWaiting());