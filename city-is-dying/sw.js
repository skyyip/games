// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b295c2aa94df.js');self.addEventListener('install',()=>self.skipWaiting());