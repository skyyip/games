// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3b35cad54d3c.js');self.addEventListener('install',()=>self.skipWaiting());