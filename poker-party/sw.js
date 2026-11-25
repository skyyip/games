// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0aefa789c425.js');self.addEventListener('install',()=>self.skipWaiting());