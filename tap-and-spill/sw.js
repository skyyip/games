// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a02d85b48da.js');self.addEventListener('install',()=>self.skipWaiting());