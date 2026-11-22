// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0cb997b4cd1a.js');self.addEventListener('install',()=>self.skipWaiting());