// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d43c317abf26.js');self.addEventListener('install',()=>self.skipWaiting());