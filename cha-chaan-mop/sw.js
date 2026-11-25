// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d14424cd3021.js');self.addEventListener('install',()=>self.skipWaiting());