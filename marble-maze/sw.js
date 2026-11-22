// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-529e41663d71.js');self.addEventListener('install',()=>self.skipWaiting());