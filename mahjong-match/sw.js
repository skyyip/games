// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3246a3876618.js');self.addEventListener('install',()=>self.skipWaiting());