// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e396d094a58.js');self.addEventListener('install',()=>self.skipWaiting());