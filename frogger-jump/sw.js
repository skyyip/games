// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e355dc02c3cb.js');self.addEventListener('install',()=>self.skipWaiting());