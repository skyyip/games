// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2fbe37b62384.js');self.addEventListener('install',()=>self.skipWaiting());