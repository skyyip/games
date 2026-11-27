// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bcee94442741.js');self.addEventListener('install',()=>self.skipWaiting());