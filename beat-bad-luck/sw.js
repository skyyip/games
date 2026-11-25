// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-86d5f882c245.js');self.addEventListener('install',()=>self.skipWaiting());