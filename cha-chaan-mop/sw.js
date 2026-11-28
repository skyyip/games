// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6793bf7374e3.js');self.addEventListener('install',()=>self.skipWaiting());