// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-dc2a243a3bf7.js');self.addEventListener('install',()=>self.skipWaiting());