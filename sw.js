// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a4dadc16941.js');self.addEventListener('install',()=>self.skipWaiting());