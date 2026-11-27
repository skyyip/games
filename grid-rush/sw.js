// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d188bc37eaa.js');self.addEventListener('install',()=>self.skipWaiting());