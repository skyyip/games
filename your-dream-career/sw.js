// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f18e942b86cc.js');self.addEventListener('install',()=>self.skipWaiting());