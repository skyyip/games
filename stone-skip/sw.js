// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3bdce67f54d3.js');self.addEventListener('install',()=>self.skipWaiting());