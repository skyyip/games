// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f8f1ef42b08.js');self.addEventListener('install',()=>self.skipWaiting());