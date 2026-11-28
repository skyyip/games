// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b8023e211146.js');self.addEventListener('install',()=>self.skipWaiting());