// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1f6551106427.js');self.addEventListener('install',()=>self.skipWaiting());