// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-73a289e2eafe.js');self.addEventListener('install',()=>self.skipWaiting());