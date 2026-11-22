// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3311b9675aaa.js');self.addEventListener('install',()=>self.skipWaiting());