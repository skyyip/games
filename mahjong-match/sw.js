// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cd8c96be6bbe.js');self.addEventListener('install',()=>self.skipWaiting());