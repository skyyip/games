// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53052d185a83.js');self.addEventListener('install',()=>self.skipWaiting());