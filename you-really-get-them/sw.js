// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92d36f45c522.js');self.addEventListener('install',()=>self.skipWaiting());