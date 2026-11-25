// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cd691446770b.js');self.addEventListener('install',()=>self.skipWaiting());