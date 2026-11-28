// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6eb491173690.js');self.addEventListener('install',()=>self.skipWaiting());