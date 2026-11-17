// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-43b09d5143a7.js');self.addEventListener('install',()=>self.skipWaiting());