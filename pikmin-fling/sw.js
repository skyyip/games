// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-485546234218.js');self.addEventListener('install',()=>self.skipWaiting());