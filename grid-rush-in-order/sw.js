// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bbc38f52cb84.js');self.addEventListener('install',()=>self.skipWaiting());