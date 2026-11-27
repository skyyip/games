// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-48822c811612.js');self.addEventListener('install',()=>self.skipWaiting());