// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0622942cf36c.js');self.addEventListener('install',()=>self.skipWaiting());