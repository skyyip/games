// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4a9bd15520ca.js');self.addEventListener('install',()=>self.skipWaiting());