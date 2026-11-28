// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f7c09fd00149.js');self.addEventListener('install',()=>self.skipWaiting());