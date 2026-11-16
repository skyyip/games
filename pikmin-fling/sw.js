// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8dedcc993093.js');self.addEventListener('install',()=>self.skipWaiting());