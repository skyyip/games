// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18f728982afa.js');self.addEventListener('install',()=>self.skipWaiting());