// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8230edec2537.js');self.addEventListener('install',()=>self.skipWaiting());