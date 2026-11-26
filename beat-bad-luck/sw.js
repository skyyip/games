// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12067654208d.js');self.addEventListener('install',()=>self.skipWaiting());