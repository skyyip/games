// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-06b2cbecf37c.js');self.addEventListener('install',()=>self.skipWaiting());