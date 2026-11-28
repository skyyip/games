// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-86026126dfbd.js');self.addEventListener('install',()=>self.skipWaiting());