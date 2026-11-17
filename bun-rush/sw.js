// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8c7ab9f4316f.js');self.addEventListener('install',()=>self.skipWaiting());