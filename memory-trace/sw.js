// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-257c7bd02964.js');self.addEventListener('install',()=>self.skipWaiting());