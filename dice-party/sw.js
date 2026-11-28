// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0cdf37bc7a27.js');self.addEventListener('install',()=>self.skipWaiting());