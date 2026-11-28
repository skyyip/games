// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9a5b4af7ed8e.js');self.addEventListener('install',()=>self.skipWaiting());