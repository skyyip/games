// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-73c51fe25ffd.js');self.addEventListener('install',()=>self.skipWaiting());