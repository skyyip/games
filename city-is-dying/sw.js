// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0a4414cd1edf.js');self.addEventListener('install',()=>self.skipWaiting());