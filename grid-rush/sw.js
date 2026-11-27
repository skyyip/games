// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-883cb95a4b4c.js');self.addEventListener('install',()=>self.skipWaiting());