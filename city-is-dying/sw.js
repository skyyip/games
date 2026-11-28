// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7e55591ba7f4.js');self.addEventListener('install',()=>self.skipWaiting());