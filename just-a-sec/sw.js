// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0d167be42704.js');self.addEventListener('install',()=>self.skipWaiting());