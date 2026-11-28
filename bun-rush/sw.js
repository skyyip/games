// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f65bb68656ac.js');self.addEventListener('install',()=>self.skipWaiting());