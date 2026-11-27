// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8d514316f423.js');self.addEventListener('install',()=>self.skipWaiting());