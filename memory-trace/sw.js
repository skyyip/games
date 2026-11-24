// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-75491554a557.js');self.addEventListener('install',()=>self.skipWaiting());