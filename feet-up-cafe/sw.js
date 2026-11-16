// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5eec75b741ad.js');self.addEventListener('install',()=>self.skipWaiting());