// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1cbfe0825155.js');self.addEventListener('install',()=>self.skipWaiting());