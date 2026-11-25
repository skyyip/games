// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0af35fde85c1.js');self.addEventListener('install',()=>self.skipWaiting());