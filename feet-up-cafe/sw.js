// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e8964ecfb06.js');self.addEventListener('install',()=>self.skipWaiting());