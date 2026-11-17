// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74ca6df5ea5d.js');self.addEventListener('install',()=>self.skipWaiting());