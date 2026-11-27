// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0c18d6fbe24b.js');self.addEventListener('install',()=>self.skipWaiting());