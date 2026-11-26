// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-59e9ac30fc94.js');self.addEventListener('install',()=>self.skipWaiting());