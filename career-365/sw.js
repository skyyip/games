// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ee45e477586c.js');self.addEventListener('install',()=>self.skipWaiting());