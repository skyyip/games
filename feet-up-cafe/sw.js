// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-878f655a2086.js');self.addEventListener('install',()=>self.skipWaiting());