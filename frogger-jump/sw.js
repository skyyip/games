// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e248abcfd29.js');self.addEventListener('install',()=>self.skipWaiting());