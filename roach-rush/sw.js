// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8144d5820daf.js');self.addEventListener('install',()=>self.skipWaiting());