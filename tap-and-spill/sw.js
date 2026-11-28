// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-61202e027f8a.js');self.addEventListener('install',()=>self.skipWaiting());