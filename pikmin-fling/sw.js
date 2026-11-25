// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-63a5ebba58dc.js');self.addEventListener('install',()=>self.skipWaiting());