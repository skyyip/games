// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-054240aa46c7.js');self.addEventListener('install',()=>self.skipWaiting());