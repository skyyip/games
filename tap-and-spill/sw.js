// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e972c707ebc7.js');self.addEventListener('install',()=>self.skipWaiting());