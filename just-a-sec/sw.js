// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4da26927c81a.js');self.addEventListener('install',()=>self.skipWaiting());