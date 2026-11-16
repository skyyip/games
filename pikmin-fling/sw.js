// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5063b9b54d01.js');self.addEventListener('install',()=>self.skipWaiting());