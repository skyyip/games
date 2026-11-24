// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e2054b1bdba2.js');self.addEventListener('install',()=>self.skipWaiting());