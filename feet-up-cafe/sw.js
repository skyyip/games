// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e9a9cb95b6c7.js');self.addEventListener('install',()=>self.skipWaiting());