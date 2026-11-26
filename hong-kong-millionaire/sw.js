// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37d877501521.js');self.addEventListener('install',()=>self.skipWaiting());