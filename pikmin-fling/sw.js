// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d49ce6d8c47.js');self.addEventListener('install',()=>self.skipWaiting());