// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7aeefe2c3082.js');self.addEventListener('install',()=>self.skipWaiting());