// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8741056f7976.js');self.addEventListener('install',()=>self.skipWaiting());