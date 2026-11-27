// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-960cfa6c17fc.js');self.addEventListener('install',()=>self.skipWaiting());