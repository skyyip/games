// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7cd651e97ed2.js');self.addEventListener('install',()=>self.skipWaiting());