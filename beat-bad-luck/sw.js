// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7d281fc7c52.js');self.addEventListener('install',()=>self.skipWaiting());