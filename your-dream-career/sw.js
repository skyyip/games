// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-684231703780.js');self.addEventListener('install',()=>self.skipWaiting());