// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bf0e41bbe10d.js');self.addEventListener('install',()=>self.skipWaiting());