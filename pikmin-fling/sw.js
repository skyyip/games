// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92d726c805c1.js');self.addEventListener('install',()=>self.skipWaiting());