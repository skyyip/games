// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-59e8c8034ef7.js');self.addEventListener('install',()=>self.skipWaiting());