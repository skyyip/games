// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f03b146236e.js');self.addEventListener('install',()=>self.skipWaiting());