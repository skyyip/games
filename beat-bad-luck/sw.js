// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b2978dee608.js');self.addEventListener('install',()=>self.skipWaiting());