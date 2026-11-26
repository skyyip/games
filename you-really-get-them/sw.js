// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-400a311ee0cd.js');self.addEventListener('install',()=>self.skipWaiting());